import { z } from 'zod';

export const openCashSchema = z.object({
  openingAmount: z.coerce
    .number({ invalid_type_error: 'Monto inválido' })
    .min(0, 'No puede ser negativo'),
  notes: z.string().max(200).optional().or(z.literal('')),
});

export const closeCashSchema = z.object({
  closingAmount: z.coerce
    .number({ invalid_type_error: 'Monto inválido' })
    .min(0, 'No puede ser negativo'),
  notes: z.string().max(200).optional().or(z.literal('')),
});

export const cashMovementSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce
    .number({ invalid_type_error: 'Monto inválido' })
    .positive('Debe ser mayor a 0'),
  reason: z.string().min(3, 'Indica el motivo').max(100),
  notes: z.string().max(200).optional().or(z.literal('')),
});

export type OpenCashInput = z.infer<typeof openCashSchema>;
export type CloseCashInput = z.infer<typeof closeCashSchema>;
export type CashMovementInput = z.infer<typeof cashMovementSchema>;
