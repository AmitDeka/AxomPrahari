import { z } from 'zod';

// Indian phone numbers only (e.g., exactly 10 digits starting with 6-9)
const phoneRegex = /^[6-9]\d{9}$/;

export const requestOtpSchema = z.object({
  phone_number: z.string().regex(phoneRegex, 'Invalid Indian phone number'),
}).strict();

export const verifyOtpSchema = z.object({
  phone_number: z.string().regex(phoneRegex, 'Invalid Indian phone number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
}).strict();

export const completeProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters')
}).strict();

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).strict();

// 8 char min, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const ASSAM_DISTRICTS = [
  'Bajali', 'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo',
  'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara',
  'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan',
  'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon',
  'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar',
  'Tinsukia', 'Udalguri', 'West Karbi Anglong', 'Tamulpur'
];

export const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().regex(passwordRegex, 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['police_admin', 'super_admin']).default('police_admin'),
  rank: z.string().min(2, 'Rank must be at least 2 characters'),
  jurisdiction_district: z.enum(ASSAM_DISTRICTS, {
    errorMap: () => ({ message: 'Invalid Assam district' }),
  }),
}).strict();

export const updateAdminSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().regex(passwordRegex, 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number').optional(),
  role: z.enum(['police_admin', 'super_admin']).optional(),
  rank: z.string().min(2, 'Rank must be at least 2 characters').optional(),
  jurisdiction_district: z.enum(ASSAM_DISTRICTS, {
    errorMap: () => ({ message: 'Invalid Assam district' }),
  }).optional(),
}).strict().refine(data => Object.keys(data).length > 0, "At least one field must be provided to update");
