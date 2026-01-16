import { Request, Response } from 'express';

import prisma from '../../prisma/client';
import { parseBigInt } from '../../utils/request';

export async function toggleCommentVote(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const commentId = parseBigInt(req.params.id);
  if (!commentId) {
    return res.status(400).json({ message: 'Invalid comment id' });
  }

  const comment = await prisma.comment.findUnique({
    where: { commentId },
  });
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  const existingVote = await prisma.commentVote.findUnique({
    where: {
      userId_commentId: {
        userId: req.user.userId,
        commentId,
      },
    },
  });

  if (existingVote) {
    const nextVotes = Math.max(0, comment.votes - 1);
    const [updated] = await prisma.$transaction([
      prisma.comment.update({
        where: { commentId },
        data: { votes: nextVotes },
      }),
      prisma.commentVote.delete({
        where: { id: existingVote.id },
      }),
    ]);

    return res.json({
      voted: false,
      votes: updated.votes,
    });
  }

  const [updated] = await prisma.$transaction([
    prisma.comment.update({
      where: { commentId },
      data: { votes: comment.votes + 1 },
    }),
    prisma.commentVote.create({
      data: {
        userId: req.user.userId,
        commentId,
      },
    }),
  ]);

  return res.json({
    voted: true,
    votes: updated.votes,
  });
}
