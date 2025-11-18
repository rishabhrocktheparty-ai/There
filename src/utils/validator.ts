import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../middleware/errorHandler';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpError(400, 'Validation failed', result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
};
