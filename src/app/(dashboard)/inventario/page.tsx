import type { Metadata } from 'next';
import { Warehouse, Package2, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getMovements, getInventoryStats } from '@/actions/inventory';
import { requireAuth } from '@/lib/auth-helpers';
import { InventoryClient } from '@/components/inventory/inventory-client';
import { Card } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Inventario' };
export const dynamic = 'force-dynamic';

export default async function InventarioPage() {
  await requireAuth();

  const [movements, stats, products, suppliers] = await Promise.all([
    getMovements({ limit: 300 }),
    getInventoryStats(),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, sku: true, stock: true },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      where: { active: true },
      select: { id: true, company: true },
      orderBy: { company: 'asc' },
    }),
  ]);

  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.company }));

  const cards = [
    {
      title: 'Productos activos',
      value: formatNumber(stats.totalProducts),
      icon: Package2,
      color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Unidades totales',
      value: formatNumber(stats.totalUnits),
      icon: Warehouse,
      color: 'bg-primary/15 text-primary',
    },
    {
      title: 'Stock crítico',
      value: stats.lowStock.toString(),
      icon: AlertTriangle,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Agotados',
      value: stats.outOfStock.toString(),
      icon: XCircle,
      color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Valor inventario',
      value: formatCurrency(stats.inventoryValue),
      icon: DollarSign,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
          <Warehouse className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Inventario</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Entradas, salidas, kardex y ajustes con auditoría
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {c.title}
                  </p>
                  <p className="mt-1 truncate text-lg font-bold">{c.value}</p>
                </div>
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', c.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <InventoryClient data={movements} products={products} suppliers={supplierOptions} />
    </div>
  );
}
