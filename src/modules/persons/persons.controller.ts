import { Request, Response } from 'express';

import prisma from '../../prisma/client';
import { parseBigInt, parseOptionalString } from '../../utils/request';

export async function listPersons(req: Request, res: Response) {
  const keyword = parseOptionalString(req.query.q) ?? parseOptionalString(req.query.name);

  const persons = await prisma.person.findMany({
    where: keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { nameZh: { contains: keyword } },
            { nameEn: { contains: keyword } },
          ],
        }
      : undefined,
    orderBy: keyword ? { name: 'asc' } : { personId: 'asc' },
    take: keyword ? 50 : 50,
  });

  return res.json({ data: persons });
}

export async function getPersonDetail(req: Request, res: Response) {
  const personId = parseBigInt(req.params.id);
  if (!personId) {
    return res.status(400).json({ message: 'Invalid person id' });
  }

  const person = await prisma.person.findUnique({
    where: { personId },
  });
  if (!person) {
    return res.status(404).json({ message: 'Person not found' });
  }

  const [actorLinks, directorLinks] = await prisma.$transaction([
    prisma.movieActor.findMany({
      where: { personId },
      orderBy: { displayOrder: 'asc' },
      include: { movie: true },
    }),
    prisma.movieDirector.findMany({
      where: { personId },
      orderBy: { displayOrder: 'asc' },
      include: { movie: true },
    }),
  ]);

  return res.json({
    person,
    actorMovies: actorLinks.map((link) => link.movie),
    directorMovies: directorLinks.map((link) => link.movie),
  });
}
