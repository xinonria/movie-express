import { Request, Response } from 'express';

import prisma from '../../prisma/client';
import { signAuthToken } from '../../middlewares/auth';
import { parseOptionalString } from '../../utils/request';
import { toPublicUser } from '../../utils/user';
import { authenticateUser, registerUser } from './auth.service';

function isEmailValid(email: string) {
  return email.includes('@') && email.includes('.');
}

export async function register(req: Request, res: Response) {
  const userEmail = parseOptionalString(req.body?.email);
  const userPassword = parseOptionalString(req.body?.password);
  const userNickname = parseOptionalString(req.body?.nickname);

  if (!userEmail || !userPassword || !userNickname) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!isEmailValid(userEmail)) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  if (userPassword.length < 6) {
    return res.status(400).json({ message: 'Password too short' });
  }

  const user = await registerUser(userEmail, userPassword, userNickname);
  if (!user) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const token = signAuthToken(user.userId);
  return res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response) {
  const userEmail = parseOptionalString(req.body?.email);
  const userPassword = parseOptionalString(req.body?.password);

  if (!userEmail || !userPassword) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  const user = await authenticateUser(userEmail, userPassword);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signAuthToken(user.userId);
  return res.status(200).json({ token, user });
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { userId: req.user.userId },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: toPublicUser(user) });
}
