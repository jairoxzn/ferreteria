import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
});

export const salePaymentSchema = z.object({
  method: z.enum(['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA']),
  amount: z.number().positive(),
  reference: z.string().max(50).optional().or(z.literal('')),
});

export const saleSchema = z
  .object({
    items: z.array(saleItemSchema).min(1, 'Agrega al menos un producto'),
    payments: z.array(salePaymentSchema).min(1, 'Agrega al menos un pago'),
    customerId: z.string().optional().or(z.literal('')).nullable(),
    discountAmount: z.number().nonnegative().default(0),
    taxRate: z.number().nonnegative().default(0),
    notes: z.string().max(300).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const subtotal = data.items.reduce(
        (acc, i) => acc + (i.quantity * i.unitPrice - i.discount),
        0,
      );
      const totalAfterDiscount = Math.max(0, subtotal - data.discountAmount);
      const tax = totalAfterDiscount * data.taxRate;
      const total = totalAfterDiscount + tax;
      const paid = data.payments.reduce((a, p) => a + p.amount, 0);
      return Math.abs(paid - total) < 0.01;
    },
    { message: 'El total de los pagos no coincide con el total de la venta', path: ['payments'] },
  );

export type SaleInput = z.infer<typeof saleSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type SalePaymentInput = z.infer<typeof salePaymentSchema>;
