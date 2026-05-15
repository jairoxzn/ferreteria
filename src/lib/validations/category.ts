import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  icon: z.string().max(40).optional().or(z.literal('')),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, 'Color inválido (usa formato #RRGGBB)')
    .optional()
    .or(z.literal('')),
  active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
