import { Request, Response } from 'express';
import prisma from '../../prisma/client';

export function getHome(_req: Request, res: Response) {
    res.json({ message: 'Hello World' });
}

export async function getHomeMovies(_req: Request, res: Response) {
    const [hotMovies, topRatedMovies, latestMovies, vipMovies] = await Promise.all([
        prisma.movie.findMany({
            orderBy: {
                doubanVotes: 'desc',
            },
            take: 10,
        }),
        prisma.movie.findMany({
            where: {
                doubanScore: {
                    gte: 8.0,
                },
            },
            orderBy: {
                doubanScore: 'desc',
            },
            take: 10,
        }),
        prisma.movie.findMany({
            orderBy: {
                releaseDate: 'desc',
            },
            take: 10,
        }),
        prisma.movie.findMany({
            where: {
                isVip: true,
            },
            orderBy: {
                doubanScore: 'desc',
            },
            take: 6,
        }),
    ]);
    res.json({
        hotMovies,
        topRatedMovies,
        latestMovies,
        vipMovies,
    });
}
