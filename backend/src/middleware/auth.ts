import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthPayload {
  userId: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  validatedQuery?: unknown;
  validatedParams?: unknown;
}

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    next(new AppError('Authentication required', 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    next(new AppError('Invalid or expired authentication token', 401));
  }
}
