import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";


export async function getSortedMovies(page: number = 1, pageSize: number = 10, sort: string = 'time') {
    // 根据排序方式获取电影列表
    const query: Prisma.MovieFindManyArgs = {
        skip: (page - 1) * pageSize,
        take: pageSize,
    }

    switch (sort) {
        case 'time':
            query.orderBy = {
                releaseDate: 'desc',
            }
            break;
        case 'score':
            query.orderBy = {
                doubanScore: 'desc',
            }
            break;
        case 'hot':
            query.orderBy = {
                doubanVotes: 'desc',
            }
            break;
        default:
            query.orderBy = {
                releaseDate: 'desc',
            }
            break;
    }
    const movies = await prisma.movie.findMany(query);
    return {
        data: movies,
        total: movies.length,
        page: page,
        pageSize: pageSize,
        sort: sort,
    };
}

export async function getMovieList(page: number, pageSize: number, sort: string) {
    return getSortedMovies(page, pageSize, sort);
}