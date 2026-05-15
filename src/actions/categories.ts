'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { categorySchema, slugify, type CategoryInput } from '@/lib/validations/category';

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  productCount: number;
  createdAt: Date;
}

export async function getCategories(): Promise<CategoryRow[]> {
  await requireRole(['ADMIN', 'VENDEDOR', 'ALMACEN']);
  const rows = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    icon: r.icon,
    color: r.color,
    active: r.active,
    productCount: r._count.products,
    createdAt: r.createdAt,
  }));
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  await requireRole(['ADMIN']);
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const baseSlug = slugify(parsed.data.name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const created = await prisma.category.create({
      data: {
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        icon: parsed.data.icon?.trim() || null,
        color: parsed.data.color?.trim() || null,
        active: parsed.data.active,
      },
    });

    revalidatePath('/categorias');
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe una categoría con ese nombre' };
    }
    return { ok: false, error: 'Error al crear la categoría' };
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  await requireRole(['ADMIN']);
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        icon: parsed.data.icon?.trim() || null,
        color: parsed.data.color?.trim() || null,
        active: parsed.data.active,
      },
    });
    revalidatePath('/categorias');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al actualizar la categoría' };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireRole(['ADMIN']);
  try {
    const used = await prisma.product.count({ where: { categoryId: id } });
    if (used > 0) {
      return {
        ok: false,
        error: `No se puede eliminar: ${used} producto${used > 1 ? 's' : ''} usa${used > 1 ? 'n' : ''} esta categoría`,
      };
    }
    await prisma.category.delete({ where: { id } });
    revalidatePath('/categorias');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al eliminar la categoría' };
  }
}

export async function toggleCategoryActive(id: string): Promise<ActionResult> {
  await requireRole(['ADMIN']);
  try {
    const cat = await prisma.category.findUnique({ where: { id }, select: { active: true } });
    if (!cat) return { ok: false, error: 'Categoría no encontrada' };
    await prisma.category.update({
      where: { id },
      data: { active: !cat.active },
    });
    revalidatePath('/categorias');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al cambiar el estado' };
  }
}
