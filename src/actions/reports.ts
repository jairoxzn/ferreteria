'use server';

import { PaymentMethod, SaleStatus } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SalesByDayReport {
  date: string;
  total: number;
  count: number;
  avgTicket: number;
}

export interface TopProductReport {
  productId: string;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
  profit: number;
}

export interface StockReportRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  totalValue: number;
  status: 'OK' | 'LOW' | 'OUT';
}

export interface SalesByMethodReport {
  method: PaymentMethod;
  total: number;
  count: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalSales: number;
  totalUnitsSold: number;
  totalProfit: number;
  avgTicket: number;
}

function parseDate(d: string): Date {
  return new Date(d);
}

export async function getSalesByDayReport(
  fromStr: string,
  toStr: string,
): Promise<SalesByDayReport[]> {
  requireRole(await auth(), ['ADMIN']);
  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  to.setHours(23, 59, 59, 999);

  const rows = await prisma.$queryRaw<
    Array<{ date: Date; total: number; count: bigint }>
  >`
    SELECT
      DATE_TRUNC('day', "createdAt") AS date,
      COALESCE(SUM(total), 0)::float AS total,
      COUNT(*)::bigint AS count
    FROM sales
    WHERE status = 'COMPLETED' AND "createdAt" >= ${from} AND "createdAt" <= ${to}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  // Rellenar días vacíos
  const map = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r]));
  const out: SalesByDayReport[] = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  while (cur <= to) {
    const key = cur.toISOString().slice(0, 10);
    const r = map.get(key);
    const total = r ? Number(r.total) : 0;
    const count = r ? Number(r.count) : 0;
    out.push({ date: key, total, count, avgTicket: count > 0 ? total / count : 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export async function getSalesSummary(
  fromStr: string,
  toStr: string,
): Promise<SalesSummary> {
  requireRole(await auth(), ['ADMIN']);
  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  to.setHours(23, 59, 59, 999);

  const where = {
    status: SaleStatus.COMPLETED,
    createdAt: { gte: from, lte: to },
  };

  const [salesAgg, details] = await Promise.all([
    prisma.sale.aggregate({
      where,
      _sum: { total: true },
      _count: true,
    }),
    prisma.saleDetail.findMany({
      where: { sale: where },
      include: { product: { select: { purchasePrice: true } } },
    }),
  ]);

  const totalRevenue = Number(salesAgg._sum.total ?? 0);
  const totalSales = salesAgg._count;
  const totalUnitsSold = details.reduce((acc, d) => acc + d.quantity, 0);
  const totalCost = details.reduce(
    (acc, d) => acc + d.product.purchasePrice.toNumber() * d.quantity,
    0,
  );
  const totalRevenueFromDetails = details.reduce((acc, d) => acc + d.subtotal.toNumber(), 0);
  const totalProfit = totalRevenueFromDetails - totalCost;

  return {
    totalRevenue,
    totalSales,
    totalUnitsSold,
    totalProfit,
    avgTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
  };
}

export async function getTopProductsReport(
  fromStr: string,
  toStr: string,
  limit = 20,
): Promise<TopProductReport[]> {
  requireRole(await auth(), ['ADMIN']);
  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  to.setHours(23, 59, 59, 999);

  const rows = await prisma.saleDetail.groupBy({
    by: ['productId'],
    where: {
      sale: { status: SaleStatus.COMPLETED, createdAt: { gte: from, lte: to } },
    },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((r) => r.productId) } },
    include: { category: { select: { name: true } } },
  });

  return rows.map((r) => {
    const p = products.find((x) => x.id === r.productId);
    const unitsSold = r._sum.quantity ?? 0;
    const revenue = Number(r._sum.subtotal ?? 0);
    const cost = p ? p.purchasePrice.toNumber() * unitsSold : 0;
    return {
      productId: r.productId,
      name: p?.name ?? '—',
      sku: p?.sku ?? '—',
      category: p?.category.name ?? '—',
      unitsSold,
      revenue,
      profit: revenue - cost,
    };
  });
}

export async function getStockReport(): Promise<StockReportRow[]> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const products = await prisma.product.findMany({
    orderBy: [{ stock: 'asc' }, { name: 'asc' }],
    include: { category: { select: { name: true } } },
  });

  return products.map((p) => {
    const stock = p.stock;
    const status: 'OK' | 'LOW' | 'OUT' =
      stock === 0 ? 'OUT' : stock <= p.minStock ? 'LOW' : 'OK';
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category.name,
      stock,
      minStock: p.minStock,
      unit: p.unit,
      purchasePrice: p.purchasePrice.toNumber(),
      salePrice: p.salePrice.toNumber(),
      totalValue: stock * p.purchasePrice.toNumber(),
      status,
    };
  });
}

export async function getSalesByPaymentMethod(
  fromStr: string,
  toStr: string,
): Promise<SalesByMethodReport[]> {
  requireRole(await auth(), ['ADMIN']);
  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  to.setHours(23, 59, 59, 999);

  const rows = await prisma.payment.groupBy({
    by: ['method'],
    where: {
      sale: { status: SaleStatus.COMPLETED, createdAt: { gte: from, lte: to } },
    },
    _sum: { amount: true },
    _count: true,
  });

  return rows.map((r) => ({
    method: r.method,
    total: Number(r._sum.amount ?? 0),
    count: r._count,
  }));
}
