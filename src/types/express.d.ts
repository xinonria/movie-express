import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: bigint;
      };
    }
  }
}

export {};
