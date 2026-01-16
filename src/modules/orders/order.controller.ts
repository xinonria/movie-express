import { Request, Response } from 'express';

import prisma from '../../prisma/client';
import { parsePositiveInt } from '../../utils/request';
import { addVipMonths, toPublicUser } from '../../utils/user';

export async function upgradeVip(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const months = parsePositiveInt(req.body?.months, 0);
  if (!months) {
    return res.status(400).json({ message: 'Invalid months' });
  }

  const user = await prisma.user.findUnique({
    where: { userId: req.user.userId },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const newExpiry = addVipMonths(user.vipExpiresAt, months);

  const [order, updatedUser] = await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: user.userId,
        orderStatus: '已完成',
        orderType: 'VIP升级',
        orderTime: new Date(),
      },
    }),
    prisma.user.update({
      where: { userId: user.userId },
      data: { vipExpiresAt: newExpiry },
    }),
  ]);

  return res.status(201).json({ order, user: toPublicUser(updatedUser) });
}
