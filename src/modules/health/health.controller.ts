import { Request, Response } from 'express';

import { getHealthStatus } from './health.service';

export function getHealth(_req: Request, res: Response) {
  res.json(getHealthStatus());
}
