import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuthService } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body as RegisterInput);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body as LoginInput);
    res.status(200).json(result);
  };

  me = (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = this.authService.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({ user });
  };
}
