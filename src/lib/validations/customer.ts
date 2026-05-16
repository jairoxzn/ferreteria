import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(120),
  document: z
    .string()
    .max(15)
    .regex(/^[\d]*$/, 'Solo dígitos')
    .optional()
    .or(z.literal('')),
  email: z.union([z.literal(''), z.string().email('Email inválido')]).optional(),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(300).optional().or(z.literal('')),
});

export type CustomerInput = z.infer<typeof customerSchema>;
