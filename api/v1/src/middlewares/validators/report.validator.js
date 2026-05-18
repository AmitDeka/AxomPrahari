import { z } from 'zod';

export const createReportSchema = z.object({
  violation_id: z.number().int().positive('Valid violation ID is required'),
  media_url: z.string().url('A valid media URL is required'),
  location_name: z.string().min(2, 'Location name must be at least 2 characters'),
  latitude: z.coerce.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.coerce.number().min(-180).max(180, 'Invalid longitude'),
  vehicle_number: z.string().regex(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i, 'Invalid Indian Vehicle Registration Number (e.g. AS01AB1234)'),
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  incident_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Time must be in HH:MM or HH:MM:SS format'),
  message: z.string().optional(),
}).strict();

export const reviewReportSchema = z.object({
  status: z.enum(['accepted', 'rejected'], { required_error: 'Status must be accepted or rejected' }),
  admin_message: z.string().optional(),
}).strict();
