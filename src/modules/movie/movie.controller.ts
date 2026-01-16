import { Request, Response } from 'express';

import prisma from '../../prisma/client';
import { parseBigInt, parseOptionalString, parsePositiveInt } from '../../utils/request';
import {
  addMovieComment,
  getFeaturedMovies,
  getMovieDetail,
  getMoviePlayInfo,
  getMovieRankings,
  listMovies,
  recordHistory,
  saveMovieRating,
  MovieSort,
} from './movie.service';

const allowedSorts: MovieSort[] = ['time', 'score', 'hot'];

export async function getMovieList(req: Request, res: Response) {
  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 21);
  const sortParam = parseOptionalString(req.query.sort);
  const sort: MovieSort = allowedSorts.includes(sortParam as MovieSort)
    ? (sortParam as MovieSort)
    : 'time';

  const genre = parseOptionalString(req.query.genre);
  const region = parseOptionalString(req.query.region);
  const keyword = parseOptionalString(req.query.q);

  const result = await listMovies({
    page,
    pageSize,
    sort,
    genre,
    region,
    keyword,
  });

  return res.json(result);
}

export async function getMovieFeatured(_req: Request, res: Response) {
  const result = await getFeaturedMovies();
  return res.json(result);
}

export async function getMovieDetailById(req: Request, res: Response) {
  const movieId = parseBigInt(req.params.id);
  if (!movieId) {
    return res.status(400).json({ message: 'Invalid movie id' });
  }

  const detail = await getMovieDetail(movieId, req.user?.userId);
  if (!detail) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  return res.json(detail);
}

export async function getMovieRankingsByType(req: Request, res: Response) {
  const type = req.params.type;
  const movies = await getMovieRankings(type);
  return res.json({ data: movies, type });
}

export async function addMovieCommentById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const movieId = parseBigInt(req.params.id);
  if (!movieId) {
    return res.status(400).json({ message: 'Invalid movie id' });
  }

  const exists = await prisma.movie.findUnique({ where: { movieId } });
  if (!exists) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  const content = parseOptionalString(req.body?.content);
  const ratingValue = req.body?.rating;
  const rating = typeof ratingValue === 'number' ? ratingValue : undefined;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: 'Rating must be 1-5' });
  }

  const comment = await addMovieComment(movieId, req.user.userId, content, rating);
  const user = await prisma.user.findUnique({
    where: { userId: req.user.userId },
    select: { userNickname: true, userAvatar: true },
  });

  return res.status(201).json({
    comment: {
      commentId: comment.commentId,
      userId: comment.userId,
      movieId: comment.movieId,
      content: comment.content,
      votes: comment.votes,
      rating: comment.rating,
      createdAt: comment.createdAt,
      userNickname: user?.userNickname ?? '',
      userAvatar: user?.userAvatar ?? null,
      hasVoted: false,
    },
  });
}

export async function rateMovieById(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const movieId = parseBigInt(req.params.id);
  if (!movieId) {
    return res.status(400).json({ message: 'Invalid movie id' });
  }

  const exists = await prisma.movie.findUnique({ where: { movieId } });
  if (!exists) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  const ratingValue = req.body?.rating;
  if (typeof ratingValue !== 'number' || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ message: 'Rating must be 1-5' });
  }

  await saveMovieRating(movieId, req.user.userId, ratingValue);
  return res.status(201).json({ message: 'Rating saved' });
}

export async function getMoviePlay(req: Request, res: Response) {
  const movieId = parseBigInt(req.params.id);
  if (!movieId) {
    return res.status(400).json({ message: 'Invalid movie id' });
  }

  const info = await getMoviePlayInfo(movieId, req.user?.userId);
  if (!info) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  if (req.user) {
    await recordHistory(req.user.userId, movieId);
  }

  return res.json(info);
}

export async function recordMovieHistory(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const movieId = parseBigInt(req.params.id);
  if (!movieId) {
    return res.status(400).json({ message: 'Invalid movie id' });
  }

  const exists = await prisma.movie.findUnique({ where: { movieId } });
  if (!exists) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  await recordHistory(req.user.userId, movieId);
  return res.status(201).json({ message: 'Recorded' });
}
