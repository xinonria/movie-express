import bcrypt from 'bcryptjs';

import prisma from '../../prisma/client';
import { toPublicUser } from '../../utils/user';

export async function registerUser(
  userEmail: string,
  userPassword: string,
  userNickname: string,
) {
  const existing = await prisma.user.findUnique({
    where: { userEmail },
  });
  if (existing) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(userPassword, 10);
  const user = await prisma.user.create({
    data: {
      userEmail,
      userPassword: hashedPassword,
      userNickname,
    },
  });
  return toPublicUser(user);
}

export async function authenticateUser(userEmail: string, userPassword: string) {
  const user = await prisma.user.findUnique({
    where: { userEmail },
  });
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(userPassword, user.userPassword);
  if (!isValid) {
    return null;
  }

  return toPublicUser(user);
}
