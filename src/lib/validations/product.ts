import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  sku: z
    .string()
    .min(2, 'SKU requerido')
    .max(40, 'Máximo 40 caracteres')
    .regex(/^[A-Z0-9\-_]+$/, 'Solo letras mayúsculas, números, guiones y guiones bajos'),
  description: z.string().max(500).optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')).nullable(),
  brand: z.string().max(60).optional().or(z.literal('')),
  unit: z.string().min(1, 'Unidad requerida').max(10),
  purchasePrice: z.coerce
    .number({ invalid_type_error: 'Precio inválido' })
    .min(0, 'No puede ser negativo')
    .max(999999, 'Demasiado alto'),
  salePrice: z.coerce
    .number({ invalid_type_error: 'Precio inválido' })
    .min(0, 'No puede ser negativo')
    .max(999999, 'Demasiado alto'),
  stock: z.coerce
    .number({ invalid_type_error: 'Stock inválido' })
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo'),
  minStock: z.coerce
    .number({ invalid_type_error: 'Stock mínimo inválido' })
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  supplierId: z.string().optional().or(z.literal('')).nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
});

export type ProductInput = z.infer<typeof productSchema>;
