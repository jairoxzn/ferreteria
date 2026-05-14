'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { MovementType, SaleStatus } from '@prisma/client';

export interface DashboardStats {
  todaySales: { total: number; count: number; delta: number };
  monthRevenue: { total: number; delta: number };
  totalStock: { units: number; products: number };
  lowStock: { count: number };
}

export interface SalesByDay {
  date: string;
  total: number;
  count: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  sold: number;
  revenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
}

export interface RecentMovement {
  id: string;
  type: MovementType;
  productName: string;
  quantity: number;
  userName: string;
  createdAt: Date;
}

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfPrevMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
const endOfPrevMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAuth();
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = endOfDay(now);
  const yesterday = startOfDay(new Date(now.getTime() - 86400000));
  const yesterdayEnd = endOfDay(new Date(now.getTime() - 86400000));

  const [todayAgg, yesterdayAgg, monthAgg, prevMonthAgg, stockAgg, lowStockCount] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { status: SaleStatus.COMPLETED, createdAt: { gte: today, lte: tomorrow } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: yesterday, lte: yesterdayEnd },
        },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { status: SaleStatus.COMPLETED, createdAt: { gte: startOfMonth(now) } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: startOfPrevMonth(now), lte: endOfPrevMonth(now) },
        },
        _sum: { total: true },
      }),
      prisma.product.aggregate({ _sum: { stock: true }, _count: true }),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count
        FROM products
        WHERE stock <= "minStock" AND status = 'ACTIVE'
      `,
    ]);

  const todayTotal = Number(todayAgg._sum.total ?? 0);
  const yTotal = Number(yesterdayAgg._sum.total ?? 0);
  const monthTotal = Number(monthAgg._sum.total ?? 0);
  const prevMonthTotal = Number(prevMonthAgg._sum.total ?? 0);

  const delta = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

  return {
    todaySales: { total: todayTotal, count: todayAgg._count, delta: delta(todayTotal, yTotal) },
    monthRevenue: { total: monthTotal, delta: delta(monthTotal, prevMonthTotal) },
    totalStock: { units: stockAgg._sum.stock ?? 0, products: stockAgg._count },
    lowStock: { count: Number(lowStockCount[0]?.count ?? 0) },
  };
}

export async function getSalesByDay(days = 14): Promise<SalesByDay[]> {
  await requireAuth();
  const since = startOfDay(new Date(Date.now() - days * 86400000));

  const rows = await prisma.$queryRaw<Array<{ date: Date; total: number; count: bigint }>>`
    SELECT
      DATE_TRUNC('day', "createdAt") AS date,
      COALESCE(SUM(total), 0)::float AS total,
      COUNT(*)::bigint AS count
    FROM sales
    WHERE status = 'COMPLETED' AND "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  // Rellenar días vacíos
  const map = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r]));
  const out: SalesByDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const r = map.get(key);
    out.push({
      date: key,
      total: r ? Number(r.total) : 0,
      count: r ? Number(r.count) : 0,
    });
  }
  return out;
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  await requireAuth();
  const rows = await prisma.saleDetail.groupBy({
    by: ['productId'],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((r) => r.productId) } },
    select: { id: true, name: true, sku: true },
  });

  return rows.map((r) => {
    const p = products.find((x) => x.id === r.productId);
    return {
      id: r.productId,
      name: p?.name ?? '—',
      sku: p?.sku ?? '—',
      sold: r._sum.quantity ?? 0,
      revenue: Number(r._sum.subtotal ?? 0),
    };
  });
}

export async function getLowStockProducts(limit = 6): Promise<LowStockProduct[]> {
  await requireAuth();
  return prisma.$queryRaw<LowStockProduct[]>`
    SELECT id, name, sku, stock, "minStock"
    FROM products
    WHERE stock <= "minStock" AND status = 'ACTIVE'
    ORDER BY (stock::float / NULLIF("minStock", 0)) ASC, stock ASC
    LIMIT ${limit}
  `;
}

export async function getRecentMovements(limit = 8): Promise<RecentMovement[]> {
  await requireAuth();
  const rows = await prisma.inventoryMovement.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    productName: r.product.name,
    quantity: r.quantity,
    userName: r.user.name,
    createdAt: r.createdAt,
  }));
}
