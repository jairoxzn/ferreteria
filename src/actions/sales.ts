'use server';

import { revalidatePath } from 'next/cache';
import {
  CashRegisterStatus,
  MovementType,
  PaymentMethod,
  Prisma,
  SaleStatus,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { generateSaleCode } from '@/lib/utils';
import { saleSchema, type SaleInput } from '@/lib/validations/sale';
import type { ActionResult } from './categories';

export interface SaleListRow {
  id: string;
  code: string;
  total: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  customerName: string | null;
  userName: string;
  itemCount: number;
  status: SaleStatus;
  createdAt: Date;
  paymentMethods: PaymentMethod[];
}

export async function getRecentSales(limit = 50): Promise<SaleListRow[]> {
  await requireAuth();
  const rows = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      customer: { select: { name: true } },
      user: { select: { name: true } },
      payments: { select: { method: true } },
      _count: { select: { details: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    total: r.total.toNumber(),
    subtotal: r.subtotal.toNumber(),
    taxAmount: r.taxAmount.toNumber(),
    discountAmount: r.discountAmount.toNumber(),
    customerName: r.customer?.name ?? null,
    userName: r.user.name,
    itemCount: r._count.details,
    status: r.status,
    createdAt: r.createdAt,
    paymentMethods: r.payments.map((p) => p.method),
  }));
}

export interface SaleTicket {
  id: string;
  code: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes: string | null;
  createdAt: Date;
  customerName: string | null;
  customerDocument: string | null;
  userName: string;
  details: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
  }>;
  payments: Array<{ method: PaymentMethod; amount: number; reference: string | null }>;
}

export async function getSaleTicket(id: string): Promise<SaleTicket | null> {
  await requireAuth();
  const s = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, document: true } },
      user: { select: { name: true } },
      details: { include: { product: { select: { name: true, sku: true } } } },
      payments: true,
    },
  });
  if (!s) return null;
  return {
    id: s.id,
    code: s.code,
    subtotal: s.subtotal.toNumber(),
    taxAmount: s.taxAmount.toNumber(),
    discountAmount: s.discountAmount.toNumber(),
    total: s.total.toNumber(),
    notes: s.notes,
    createdAt: s.createdAt,
    customerName: s.customer?.name ?? null,
    customerDocument: s.customer?.document ?? null,
    userName: s.user.name,
    details: s.details.map((d) => ({
      productName: d.product.name,
      sku: d.product.sku,
      quantity: d.quantity,
      unitPrice: d.unitPrice.toNumber(),
      discount: d.discount.toNumber(),
      subtotal: d.subtotal.toNumber(),
    })),
    payments: s.payments.map((p) => ({
      method: p.method,
      amount: p.amount.toNumber(),
      reference: p.reference,
    })),
  };
}

export async function createSale(input: SaleInput): Promise<ActionResult<{ id: string; code: string }>> {
  const session = await requireRole(['ADMIN', 'VENDEDOR']);
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar caja abierta del usuario
      const cash = await tx.cashRegister.findFirst({
        where: { userId: session.user.id, status: CashRegisterStatus.OPEN },
      });
      if (!cash) throw new Error('Debes abrir la caja antes de vender');

      // 2. Verificar productos y stock
      const productIds = parsed.data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, stock: true },
      });
      const stockMap = new Map(products.map((p) => [p.id, { stock: p.stock, name: p.name }]));

      for (const item of parsed.data.items) {
        const p = stockMap.get(item.productId);
        if (!p) throw new Error(`Producto no encontrado: ${item.productId}`);
        if (p.stock < item.quantity) {
          throw new Error(`Stock insuficiente de "${p.name}". Disponible: ${p.stock}`);
        }
      }

      // 3. Calcular totales
      const subtotal = parsed.data.items.reduce(
        (acc, i) => acc + (i.quantity * i.unitPrice - i.discount),
        0,
      );
      const totalAfterDiscount = Math.max(0, subtotal - parsed.data.discountAmount);
      const taxAmount = totalAfterDiscount * parsed.data.taxRate;
      const total = totalAfterDiscount + taxAmount;

      // 4. Generar código correlativo
      const count = await tx.sale.count();
      const code = generateSaleCode(count + 1);

      // 5. Crear la venta con detalles y pagos
      const sale = await tx.sale.create({
        data: {
          code,
          subtotal: new Prisma.Decimal(subtotal),
          taxAmount: new Prisma.Decimal(taxAmount),
          discountAmount: new Prisma.Decimal(parsed.data.discountAmount),
          total: new Prisma.Decimal(total),
          notes: parsed.data.notes?.trim() || null,
          status: SaleStatus.COMPLETED,
          userId: session.user.id,
          customerId: parsed.data.customerId || null,
          cashRegisterId: cash.id,
          details: {
            create: parsed.data.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: new Prisma.Decimal(i.unitPrice),
              discount: new Prisma.Decimal(i.discount),
              subtotal: new Prisma.Decimal(i.quantity * i.unitPrice - i.discount),
            })),
          },
          payments: {
            create: parsed.data.payments.map((p) => ({
              method: p.method as PaymentMethod,
              amount: new Prisma.Decimal(p.amount),
              reference: p.reference?.trim() || null,
            })),
          },
        },
      });

      // 6. Decrementar stock y registrar movimientos
      for (const item of parsed.data.items) {
        const p = stockMap.get(item.productId)!;
        const stockBefore = p.stock;
        const stockAfter = stockBefore - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: stockAfter },
        });
        await tx.inventoryMovement.create({
          data: {
            type: MovementType.SALE,
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            reference: code,
            productId: item.productId,
            userId: session.user.id,
            saleId: sale.id,
          },
        });
      }

      return { id: sale.id, code: sale.code };
    });

    revalidatePath('/ventas');
    revalidatePath('/inventario');
    revalidatePath('/productos');
    revalidatePath('/caja');
    revalidatePath('/dashboard');
    return { ok: true, data: result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Error al registrar la venta',
    };
  }
}
