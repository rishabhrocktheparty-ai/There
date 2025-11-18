import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from './errorHandler';
import { AdminRole, AuthUser } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'insecure_dev_secret';

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing or invalid authorization header'));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = payload;
    return next();
  } catch (err) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
};

export const requireRole = (roles: AdminRole[]) => {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, 'Unauthorized'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Forbidden'));
    }
    return next();
  };
};
