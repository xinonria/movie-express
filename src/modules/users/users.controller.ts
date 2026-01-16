import { Request, Response } from 'express';

import prisma from '../../prisma/client';
import { parsePositiveInt } from '../../utils/request';
import { toPublicUser } from '../../utils/user';

export async function getProfile(req: Request, res: Response) {
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

export async function getHistory(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 20);

  const [total, records] = await prisma.$transaction([
    prisma.history.count({
      where: { userId: req.user.userId },
    }),
    prisma.history.findMany({
      where: { userId: req.user.userId },
      orderBy: { historyTime: 'desc' },
      include: { movie: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return res.json({
    data: records,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function getOrders(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const orders = await prisma.order.findMany({
    where: { userId: req.user.userId },
    orderBy: { orderTime: 'desc' },
  });

  return res.json({ data: orders });
}
