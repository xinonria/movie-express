import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';

type AuthTokenPayload = {
  userId: string;
};

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  return token;
}

function parseToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    if (!payload || typeof payload.userId !== 'string') {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const payload = parseToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    req.user = { userId: BigInt(payload.userId) };
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }
  const payload = parseToken(token);
  if (payload) {
    try {
      req.user = { userId: BigInt(payload.userId) };
    } catch {
      req.user = undefined;
    }
  }
  return next();
}

export function signAuthToken(userId: bigint): string {
  return jwt.sign({ userId: userId.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}
