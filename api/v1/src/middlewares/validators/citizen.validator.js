import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
}).strict().refine(data => data.full_name !== undefined || data.email !== undefined, {
  message: "At least one of full_name or email must be provided to update.",
  path: []
});

export const toggleCitizenStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
}).strict();
