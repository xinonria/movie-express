import { Movie, Prisma } from '@prisma/client';

import prisma from '../../prisma/client';
import { isVipActive } from '../../utils/user';

export type MovieSort = 'time' | 'score' | 'hot';

export type MovieListFilters = {
  page: number;
  pageSize: number;
  sort: MovieSort;
  genre?: string;
  region?: string;
  keyword?: string;
};

function getOrderBy(sort: MovieSort): Prisma.MovieOrderByWithRelationInput {
  switch (sort) {
    case 'score':
      return { doubanScore: 'desc' };
    case 'hot':
      return { doubanVotes: 'desc' };
    case 'time':
    default:
      return { releaseDate: 'desc' };
  }
}

function buildSearchWhere(filters: MovieListFilters): Prisma.MovieWhereInput {
  const where: Prisma.MovieWhereInput = {};
  if (filters.genre) {
    where.genres = { contains: filters.genre };
  }
  if (filters.region) {
    where.regions = { contains: filters.region };
  }
  if (filters.keyword) {
    where.OR = [
      { name: { contains: filters.keyword } },
      { alias: { contains: filters.keyword } },
      { actors: { contains: filters.keyword } },
      { directors: { contains: filters.keyword } },
      { tags: { contains: filters.keyword } },
      { storyline: { contains: filters.keyword } },
    ];
  }
  return where;
}

export async function listMovies(filters: MovieListFilters) {
  const where = buildSearchWhere(filters);
  const orderBy = getOrderBy(filters.sort);

  const [total, movies] = await prisma.$transaction([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  return {
    data: movies,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize),
    sort: filters.sort,
  };
}

export async function getFeaturedMovies() {
  const [hotMovies, topRatedMovies, latestMovies, vipMovies] = await Promise.all([
    prisma.movie.findMany({
      orderBy: [{ doubanVotes: 'desc' }, { doubanScore: 'desc' }],
      take: 12,
    }),
    prisma.movie.findMany({
      where: {
        doubanScore: {
          gte: 8.0,
        },
      },
      orderBy: [{ doubanScore: 'desc' }, { doubanVotes: 'desc' }],
      take: 10,
    }),
    prisma.movie.findMany({
      orderBy: { releaseDate: 'desc' },
      take: 10,
    }),
    prisma.movie.findMany({
      where: { isVip: true },
      orderBy: { doubanScore: 'desc' },
      take: 6,
    }),
  ]);

  return {
    hotMovies,
    topRatedMovies,
    latestMovies,
    vipMovies,
  };
}

export async function getMovieDetail(movieId: bigint, userId?: bigint) {
  const movie = await prisma.movie.findUnique({
    where: { movieId },
    include: {
      movieActors: {
        orderBy: { displayOrder: 'asc' },
        include: { person: true },
      },
      movieDirectors: {
        orderBy: { displayOrder: 'asc' },
        include: { person: true },
      },
    },
  });

  if (!movie) {
    return null;
  }

  const [comments, ratingStats, relatedMovies] = await prisma.$transaction([
    prisma.comment.findMany({
      where: { movieId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            userId: true,
            userNickname: true,
            userAvatar: true,
          },
        },
      },
    }),
    prisma.rating.aggregate({
      where: { movieId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.$queryRaw<Movie[]>`SELECT * FROM movie WHERE movie_id <> ${movieId} ORDER BY RAND() LIMIT 10`,
  ]);

  const commentIds = comments.map((comment) => comment.commentId);
  const votedCommentIds = userId
    ? await prisma.commentVote.findMany({
        where: {
          userId,
          commentId: { in: commentIds },
        },
        select: { commentId: true },
      })
    : [];
  const votedSet = new Set(votedCommentIds.map((vote) => vote.commentId));

  return {
    movie,
    comments: comments.map((comment) => ({
      commentId: comment.commentId,
      userId: comment.userId,
      movieId: comment.movieId,
      content: comment.content,
      votes: comment.votes,
      rating: comment.rating,
      createdAt: comment.createdAt,
      userNickname: comment.user.userNickname,
      userAvatar: comment.user.userAvatar,
      hasVoted: votedSet.has(comment.commentId),
    })),
    ratingSummary: {
      averageRating: ratingStats._avg.rating,
      ratingCount: ratingStats._count.rating,
    },
    actors: movie.movieActors.map((entry) => entry.person),
    directors: movie.movieDirectors.map((entry) => entry.person),
    relatedMovies,
  };
}

export async function addMovieComment(
  movieId: bigint,
  userId: bigint,
  content: string,
  rating?: number,
) {
  if (rating) {
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          movieId,
          userId,
          content,
          rating,
          votes: 0,
        },
      }),
      prisma.rating.upsert({
        where: {
          userId_movieId: {
            userId,
            movieId,
          },
        },
        update: {
          rating,
          createdAt: new Date(),
        },
        create: {
          userId,
          movieId,
          rating,
        },
      }),
    ]);
    return comment;
  }

  return prisma.comment.create({
    data: {
      movieId,
      userId,
      content,
      votes: 0,
    },
  });
}

export async function saveMovieRating(
  movieId: bigint,
  userId: bigint,
  rating: number,
) {
  return prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
    update: {
      rating,
      createdAt: new Date(),
    },
    create: {
      userId,
      movieId,
      rating,
    },
  });
}

async function getMoviesWithRecentActivity(since: Date) {
  const stats = await prisma.comment.groupBy({
    by: ['movieId'],
    where: {
      createdAt: {
        gte: since,
      },
    },
    _count: { movieId: true },
    orderBy: { _count: { movieId: 'desc' } },
    take: 50,
  });

  const movieIds = stats.map((entry) => entry.movieId);
  if (!movieIds.length) {
    return prisma.movie.findMany({
      orderBy: { releaseDate: 'desc' },
      take: 20,
    });
  }

  const movies = await prisma.movie.findMany({
    where: { movieId: { in: movieIds } },
  });

  const movieMap = new Map(movies.map((movie) => [movie.movieId, movie]));
  return movieIds
    .map((id) => movieMap.get(id))
    .filter((movie): movie is Movie => Boolean(movie));
}

export async function getMovieRankings(type: string) {
  switch (type) {
    case 'week':
    case 'weekly': {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      return getMoviesWithRecentActivity(since);
    }
    case 'month':
    case 'monthly': {
      const since = new Date();
      since.setMonth(since.getMonth() - 1);
      return getMoviesWithRecentActivity(since);
    }
    case 'today': {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      return getMoviesWithRecentActivity(since);
    }
    case 'rating':
      return prisma.movie.findMany({
        where: { doubanScore: { gte: 8.0 } },
        orderBy: [{ doubanScore: 'desc' }, { doubanVotes: 'desc' }],
        take: 50,
      });
    case 'hot':
      return prisma.movie.findMany({
        orderBy: { doubanVotes: 'desc' },
        take: 50,
      });
    case 'score':
      return prisma.movie.findMany({
        where: { doubanVotes: { gte: 1000 } },
        orderBy: { doubanScore: 'desc' },
        take: 50,
      });
    case 'new':
      return prisma.movie.findMany({
        orderBy: { releaseDate: 'desc' },
        take: 50,
      });
    case 'classic':
      return prisma.movie.findMany({
        where: {
          year: { lte: 2000 },
          doubanScore: { gte: 8.0 },
        },
        orderBy: [{ doubanScore: 'desc' }, { doubanVotes: 'desc' }],
        take: 50,
      });
    case 'all':
    case 'allTime':
    default:
      return prisma.movie.findMany({
        orderBy: [{ doubanScore: 'desc' }, { doubanVotes: 'desc' }],
        take: 50,
      });
  }
}

export async function getMoviePlayInfo(movieId: bigint, userId?: bigint) {
  const movie = await prisma.movie.findUnique({
    where: { movieId },
  });
  if (!movie) {
    return null;
  }

  let isVip = false;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { userId },
    });
    if (user) {
      isVip = isVipActive(user.vipExpiresAt);
    }
  }

  const videoPath = `/videos/movie_${movieId}.mp4`;
  const trialPath = `/videos/movie_${movieId}_trial.mp4`;
  const isTrial = movie.isVip && !isVip;

  return {
    movie,
    isVip,
    isVipMovie: movie.isVip,
    isTrial,
    videoPath: isTrial ? trialPath : videoPath,
  };
}

export async function recordHistory(userId: bigint, movieId: bigint) {
  return prisma.history.create({
    data: {
      userId,
      movieId,
      historyTime: new Date(),
    },
  });
}
