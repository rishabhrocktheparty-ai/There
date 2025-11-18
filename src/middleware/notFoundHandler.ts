import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};
