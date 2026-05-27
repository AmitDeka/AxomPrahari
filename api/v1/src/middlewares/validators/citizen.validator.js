import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
}).strict().refine(data => data.full_name !== undefined || data.email !== undefined || data.username !== undefined, {
  message: "At least one of full_name, email, or username must be provided to update.",
  path: []
});

export const toggleCitizenStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
}).strict();

export const createFeedbackSchema = z.object({
  citizen_id: z.string().min(1, 'Citizen ID is required'),
  feedback_category: z.string().min(2, 'Feedback category must be at least 2 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  image_key: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional(),
}).strict();
