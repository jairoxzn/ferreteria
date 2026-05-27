'use server';

import { revalidatePath } from 'next/cache';
import { Prisma, ProductStatus } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { productSchema, type ProductInput } from '@/lib/validations/product';
import type { ActionResult } from './categories';

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  image: string | null;
  unit: string;
  brand: string | null;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  supplierId: string | null;
  supplierName: string | null;
}

export async function getProducts(): Promise<ProductRow[]> {
  requireAuth(await auth());
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true, color: true } },
      supplier: { select: { id: true, company: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    sku: r.sku,
    description: r.description,
    image: r.image,
    unit: r.unit,
    brand: r.brand,
    purchasePrice: r.purchasePrice.toNumber(),
    salePrice: r.salePrice.toNumber(),
    stock: r.stock,
    minStock: r.minStock,
    status: r.status,
    categoryId: r.category.id,
    categoryName: r.category.name,
    categoryColor: r.category.color,
    supplierId: r.supplier?.id ?? null,
    supplierName: r.supplier?.company ?? null,
  }));
}

export async function generateNextSku(categoryId?: string): Promise<string> {
  requireAuth(await auth());
  let prefix = 'PROD';
  if (categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });
    if (cat) {
      prefix = cat.name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z]/g, '')
        .slice(0, 3)
        .toUpperCase();
      if (prefix.length < 2) prefix = 'PROD';
    }
  }

  const last = await prisma.product.findFirst({
    where: { sku: { startsWith: `${prefix}-` } },
    orderBy: { sku: 'desc' },
    select: { sku: true },
  });

  let nextNum = 1;
  if (last) {
    const match = last.sku.match(/-(\d+)$/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

export async function createProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const created = await prisma.product.create({
      data: {
        name: parsed.data.name.trim(),
        sku: parsed.data.sku.trim().toUpperCase(),
        description: parsed.data.description?.trim() || null,
        image: parsed.data.image?.trim() || null,
        brand: parsed.data.brand?.trim() || null,
        unit: parsed.data.unit,
        purchasePrice: new Prisma.Decimal(parsed.data.purchasePrice),
        salePrice: new Prisma.Decimal(parsed.data.salePrice),
        stock: parsed.data.stock,
        minStock: parsed.data.minStock,
        status: parsed.data.status,
        categoryId: parsed.data.categoryId,
        supplierId: parsed.data.supplierId || null,
      },
    });
    revalidatePath('/productos');
    revalidatePath('/dashboard');
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un producto con ese SKU' };
    }
    return { ok: false, error: 'Error al crear el producto' };
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        sku: parsed.data.sku.trim().toUpperCase(),
        description: parsed.data.description?.trim() || null,
        image: parsed.data.image?.trim() || null,
        brand: parsed.data.brand?.trim() || null,
        unit: parsed.data.unit,
        purchasePrice: new Prisma.Decimal(parsed.data.purchasePrice),
        salePrice: new Prisma.Decimal(parsed.data.salePrice),
        stock: parsed.data.stock,
        minStock: parsed.data.minStock,
        status: parsed.data.status,
        categoryId: parsed.data.categoryId,
        supplierId: parsed.data.supplierId || null,
      },
    });
    revalidatePath('/productos');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un producto con ese SKU' };
    }
    return { ok: false, error: 'Error al actualizar el producto' };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN']);
  try {
    const inSales = await prisma.saleDetail.count({ where: { productId: id } });
    if (inSales > 0) {
      return {
        ok: false,
        error: `No se puede eliminar: producto usado en ${inSales} venta${inSales > 1 ? 's' : ''}. Considera desactivarlo en su lugar.`,
      };
    }
    await prisma.product.delete({ where: { id } });
    revalidatePath('/productos');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al eliminar el producto' };
  }
}

export async function toggleProductStatus(
  id: string,
  status: ProductStatus,
): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  try {
    await prisma.product.update({ where: { id }, data: { status } });
    revalidatePath('/productos');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al cambiar el estado' };
  }
}
