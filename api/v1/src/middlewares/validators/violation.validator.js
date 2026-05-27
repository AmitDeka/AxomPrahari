import { z } from 'zod';

export const createViolationSchema = z.object({
  offence_name: z.string().min(3, 'Offence name must be at least 3 characters'),
  mv_act_code: z.string().min(2, 'MV Act Code is required'),
  fine_amount: z.coerce.number().positive('Fine amount must be a positive number'),
  reward_points: z.coerce.number().int().nonnegative('Reward points must be 0 or positive').default(0),
  penalty: z.string().min(3, 'Penalty must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  evidence_requirement: z.string().min(5, 'Evidence requirement must be at least 5 characters'),
}).strict();

export const updateViolationSchema = z.object({
  offence_name: z.string().min(3, 'Offence name must be at least 3 characters').optional(),
  mv_act_code: z.string().min(2, 'MV Act Code is required').optional(),
  fine_amount: z.coerce.number().positive('Fine amount must be a positive number').optional(),
  reward_points: z.coerce.number().int().nonnegative('Reward points must be 0 or positive').optional(),
  penalty: z.string().min(3, 'Penalty must be at least 3 characters').optional(),
  description: z.string().min(5, 'Description must be at least 5 characters').optional(),
  evidence_requirement: z.string().min(5, 'Evidence requirement must be at least 5 characters').optional(),
}).strict().refine(data => Object.keys(data).length > 0, "At least one field must be provided to update");
