import { z } from 'zod';

export const settingsSchema = z.object({
  companyName: z.string().max(120).optional().or(z.literal('')),
  ruc: z
    .string()
    .regex(/^\d{11}$|^$/, 'El RUC debe tener 11 dígitos')
    .optional()
    .or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.union([z.literal(''), z.string().email('Email inválido')]).optional(),
  logo: z.string().url().optional().or(z.literal('')).nullable(),
  igv: z.coerce.number().min(0, 'Mínimo 0').max(1, 'Máximo 1 (=100%)'),
  currency: z.string().min(3).max(3),
  ticketHeader: z.string().max(200).optional().or(z.literal('')),
  ticketFooter: z.string().max(200).optional().or(z.literal('')),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
