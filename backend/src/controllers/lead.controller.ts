import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { LeadService } from '../services/lead.service';
import {
  CreateLeadInput,
  ListLeadsQuery,
  UpdateLeadInput,
} from '../validators/lead.validator';

export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  private getUserId(req: AuthenticatedRequest): number {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    return req.user.userId;
  }

  private getLeadId(req: AuthenticatedRequest): number {
    const params = req.validatedParams as { id: number } | undefined;
    return params ? params.id : Number(req.params.id);
  }

  list = (req: AuthenticatedRequest, res: Response): void => {
    const userId = this.getUserId(req);
    const query = (req.validatedQuery ?? req.query) as ListLeadsQuery;
    const result = this.leadService.list(userId, query);
    res.status(200).json(result);
  };

  stats = (req: AuthenticatedRequest, res: Response): void => {
    const userId = this.getUserId(req);
    const stats = this.leadService.getStats(userId);
    res.status(200).json(stats);
  };

  getById = (req: AuthenticatedRequest, res: Response): void => {
    const userId = this.getUserId(req);
    const lead = this.leadService.getById(userId, this.getLeadId(req));
    res.status(200).json({ data: lead });
  };

  create = (req: AuthenticatedRequest, res: Response): void => {
    const userId = this.getUserId(req);
    const lead = this.leadService.create(userId, req.body as CreateLeadInput);
    res.status(201).json({ data: lead });
  };

  update = (req: AuthenticatedRequest, res: Response): void => {
    const userId = this.getUserId(req);
    const lead = this.leadService.update(
      userId,
      this.getLeadId(req),
      req.body as UpdateLeadInput
    );
    res.status(200).json({ data: lead });
  };

  delete = (req: AuthenticatedRequest, res: Response): void => {
    const userId = this.getUserId(req);
    this.leadService.delete(userId, this.getLeadId(req));
    res.status(204).send();
  };
}
