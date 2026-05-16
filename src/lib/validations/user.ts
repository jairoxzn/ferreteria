import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  email: z.string().email('Email inválido').toLowerCase(),
  role: z.enum(['ADMIN', 'VENDEDOR', 'ALMACEN']),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(60, 'Máximo 60 caracteres'),
  phone: z.string().max(20).optional().or(z.literal('')),
  active: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial({ password: true });

export const passwordResetSchema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres').max(60),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
