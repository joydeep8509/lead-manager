import { NextFunction, Response } from 'express';
import { ZodSchema } from 'zod';
import { AuthenticatedRequest } from './auth';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }

    // Express 5 exposes req.query as a read-only getter, so store parsed query/params separately
    if (target === 'body') {
      req.body = result.data;
    } else if (target === 'query') {
      req.validatedQuery = result.data;
    } else {
      req.validatedParams = result.data;
    }

    next();
  };
}
