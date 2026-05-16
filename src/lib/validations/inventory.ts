import { z } from 'zod';

export const movementSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.coerce
    .number({ invalid_type_error: 'Cantidad inválida' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1'),
  unitCost: z.coerce.number().min(0).optional(),
  reference: z.string().max(50).optional().or(z.literal('')),
  supplierId: z.string().optional().or(z.literal('')),
  notes: z.string().max(300).optional().or(z.literal('')),
});

export type MovementInput = z.infer<typeof movementSchema>;

export const adjustmentSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  newStock: z.coerce.number().int().min(0, 'No puede ser negativo'),
  reason: z.string().min(3, 'Indica el motivo').max(200),
});

export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
