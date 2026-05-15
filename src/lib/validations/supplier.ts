import { z } from 'zod';

export const supplierSchema = z.object({
  company: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  ruc: z
    .string()
    .regex(/^\d{11}$/, 'El RUC debe tener exactamente 11 dígitos numéricos'),
  contact: z.string().max(100).optional().or(z.literal('')),
  email: z.union([z.literal(''), z.string().email('Email inválido')]).optional(),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  active: z.boolean().default(true),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
