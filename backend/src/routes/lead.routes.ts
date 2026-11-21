import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createLeadSchema,
  leadIdParamSchema,
  listLeadsQuerySchema,
  updateLeadSchema,
} from '../validators/lead.validator';

export function createLeadRouter(controller: LeadController): Router {
  const router = Router();

  router.use(requireAuth);

  router.get('/stats', controller.stats);
  router.get('/', validate(listLeadsQuerySchema, 'query'), controller.list);
  router.post('/', validate(createLeadSchema, 'body'), controller.create);
  router.get('/:id', validate(leadIdParamSchema, 'params'), controller.getById);
  router.put(
    '/:id',
    validate(leadIdParamSchema, 'params'),
    validate(updateLeadSchema, 'body'),
    controller.update
  );
  router.patch(
    '/:id',
    validate(leadIdParamSchema, 'params'),
    validate(updateLeadSchema, 'body'),
    controller.update
  );
  router.delete(
    '/:id',
    validate(leadIdParamSchema, 'params'),
    controller.delete
  );

  return router;
}
