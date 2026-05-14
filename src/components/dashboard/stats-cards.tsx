'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package2,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { DashboardStats } from '@/actions/dashboard';

interface Props {
  stats: DashboardStats;
}

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      title: 'Ventas de hoy',
      value: formatCurrency(stats.todaySales.total),
      subtitle: `${stats.todaySales.count} transacción${stats.todaySales.count === 1 ? '' : 'es'}`,
      delta: stats.todaySales.delta,
      icon: ShoppingBag,
      iconBg: 'bg-primary/15 text-primary',
    },
    {
      title: 'Ganancias del mes',
      value: formatCurrency(stats.monthRevenue.total),
      subtitle: 'Mes en curso',
      delta: stats.monthRevenue.delta,
      icon: DollarSign,
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Stock total',
      value: formatNumber(stats.totalStock.units),
      subtitle: `${stats.totalStock.products} productos`,
      icon: Package2,
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Stock crítico',
      value: stats.lowStock.count.toString(),
      subtitle: 'Productos por reponer',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      tone: stats.lowStock.count > 0 ? 'warning' : undefined,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const positive = (c.delta ?? 0) >= 0;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {c.title}
                  </p>
                  <p className="mt-2 truncate text-2xl font-bold tracking-tight">{c.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
                </div>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', c.iconBg)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {c.delta !== undefined && (
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
                      positive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/15 text-destructive',
                    )}
                  >
                    {positive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(c.delta).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. periodo anterior</span>
                </div>
              )}

              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-foreground/[0.02]"
              />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
