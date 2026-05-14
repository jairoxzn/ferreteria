import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalendarDays, Download } from 'lucide-react';
import { auth } from '@/../auth';
import {
  getDashboardStats,
  getSalesByDay,
  getTopProducts,
  getLowStockProducts,
  getRecentMovements,
} from '@/actions/dashboard';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { TopProductsCard } from '@/components/dashboard/top-products';
import { LowStockAlert } from '@/components/dashboard/low-stock-alert';
import { RecentMovements } from '@/components/dashboard/recent-movements';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-20" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="col-span-2 p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-24" />
          <Skeleton className="mt-6 h-[280px] w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-5 w-32" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const [stats, sales, topProducts, lowStock, movements] = await Promise.all([
    getDashboardStats(),
    getSalesByDay(14),
    getTopProducts(5),
    getLowStockProducts(6),
    getRecentMovements(8),
  ]);

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <SalesChart data={sales} />
        <TopProductsCard products={topProducts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LowStockAlert products={lowStock} />
        <RecentMovements movements={movements} />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Hola, {session?.user.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="capitalize">{today}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
