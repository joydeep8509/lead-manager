import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post('/register', validate(registerSchema, 'body'), controller.register);
  router.post('/login', validate(loginSchema, 'body'), controller.login);
  router.get('/me', requireAuth, controller.me);

  return router;
}
