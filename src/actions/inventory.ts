'use server';

import { revalidatePath } from 'next/cache';
import { MovementType, Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import {
  movementSchema,
  adjustmentSchema,
  type MovementInput,
  type AdjustmentInput,
} from '@/lib/validations/inventory';
import type { ActionResult } from './categories';

export interface MovementRow {
  id: string;
  type: MovementType;
  quantity: number;
  unitCost: number | null;
  reference: string | null;
  notes: string | null;
  stockBefore: number;
  stockAfter: number;
  productId: string;
  productName: string;
  productSku: string;
  userName: string;
  supplierName: string | null;
  createdAt: Date;
}

interface GetMovementsArgs {
  productId?: string;
  type?: MovementType;
  limit?: number;
}

export async function getMovements({
  productId,
  type,
  limit = 200,
}: GetMovementsArgs = {}): Promise<MovementRow[]> {
  requireAuth(await auth());
  const rows = await prisma.inventoryMovement.findMany({
    where: { productId, type },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      product: { select: { name: true, sku: true } },
      user: { select: { name: true } },
      supplier: { select: { company: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    quantity: r.quantity,
    unitCost: r.unitCost?.toNumber() ?? null,
    reference: r.reference,
    notes: r.notes,
    stockBefore: r.stockBefore,
    stockAfter: r.stockAfter,
    productId: r.productId,
    productName: r.product.name,
    productSku: r.product.sku,
    userName: r.user.name,
    supplierName: r.supplier?.company ?? null,
    createdAt: r.createdAt,
  }));
}

export interface InventoryStats {
  totalProducts: number;
  totalUnits: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  requireAuth(await auth());

  const [allProducts, lowStock, outOfStock] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { stock: true, purchasePrice: true },
    }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count FROM products
      WHERE stock > 0 AND stock <= "minStock" AND status = 'ACTIVE'
    `,
    prisma.product.count({ where: { stock: 0, status: 'ACTIVE' } }),
  ]);

  const totalUnits = allProducts.reduce((acc, p) => acc + p.stock, 0);
  const inventoryValue = allProducts.reduce(
    (acc, p) => acc + p.stock * p.purchasePrice.toNumber(),
    0,
  );

  return {
    totalProducts: allProducts.length,
    totalUnits,
    lowStock: Number(lowStock[0]?.count ?? 0),
    outOfStock,
    inventoryValue,
  };
}

export async function createMovement(input: MovementInput): Promise<ActionResult> {
  const session = requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const parsed = movementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  if (parsed.data.type === 'ADJUSTMENT') {
    return { ok: false, error: 'Usa createAdjustment para ajustes manuales' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: parsed.data.productId },
        select: { stock: true, name: true },
      });
      if (!product) throw new Error('Producto no encontrado');

      const stockBefore = product.stock;
      const delta = parsed.data.type === 'IN' ? parsed.data.quantity : -parsed.data.quantity;
      const stockAfter = stockBefore + delta;

      if (stockAfter < 0) {
        throw new Error(
          `Stock insuficiente. Disponible: ${stockBefore}, intentas sacar: ${parsed.data.quantity}`,
        );
      }

      await tx.product.update({
        where: { id: parsed.data.productId },
        data: { stock: stockAfter },
      });

      await tx.inventoryMovement.create({
        data: {
          type: parsed.data.type,
          quantity: parsed.data.quantity,
          unitCost: parsed.data.unitCost
            ? new Prisma.Decimal(parsed.data.unitCost)
            : null,
          reference: parsed.data.reference?.trim() || null,
          notes: parsed.data.notes?.trim() || null,
          stockBefore,
          stockAfter,
          productId: parsed.data.productId,
          userId: session.user.id,
          supplierId: parsed.data.supplierId?.trim() || null,
        },
      });
    });

    revalidatePath('/inventario');
    revalidatePath('/productos');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Error al registrar el movimiento',
    };
  }
}

export async function createAdjustment(input: AdjustmentInput): Promise<ActionResult> {
  const session = requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const parsed = adjustmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: parsed.data.productId },
        select: { stock: true },
      });
      if (!product) throw new Error('Producto no encontrado');

      const stockBefore = product.stock;
      const stockAfter = parsed.data.newStock;
      const quantity = Math.abs(stockAfter - stockBefore);

      if (quantity === 0) throw new Error('El stock ingresado es igual al actual');

      await tx.product.update({
        where: { id: parsed.data.productId },
        data: { stock: stockAfter },
      });

      await tx.inventoryMovement.create({
        data: {
          type: MovementType.ADJUSTMENT,
          quantity,
          notes: parsed.data.reason,
          stockBefore,
          stockAfter,
          productId: parsed.data.productId,
          userId: session.user.id,
        },
      });
    });

    revalidatePath('/inventario');
    revalidatePath('/productos');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Error al ajustar el stock',
    };
  }
}
