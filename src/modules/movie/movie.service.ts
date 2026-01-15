import prisma from "../../prisma/client";


export async function getSortedMovies(page: number, pageSize: number, sort: string) {
    // 根据排序方式获取电影列表
    switch (sort) {
        case 'time':
            return prisma.movie.findMany({
                orderBy: {
                    doubanVotes: 'desc',
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });
    }
}

export async function getMovieList(page: number, pageSize: number, sort: string) {
    return getSortedMovies(page, pageSize, sort);
}