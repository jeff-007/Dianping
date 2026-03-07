import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^a-zA-Z0-9]/, 'Must contain special character');

export const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number');

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  phone: phoneSchema,
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const merchantRegisterSchema = registerSchema.extend({
  shopName: z.string().min(2, 'Shop name is required'),
  shopAddress: z.string().min(5, 'Address is required'),
  licenseUrl: z.string().url('Invalid license URL'),
  idCardUrl: z.string().url('Invalid ID card URL'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MerchantRegisterInput = z.infer<typeof merchantRegisterSchema>;
