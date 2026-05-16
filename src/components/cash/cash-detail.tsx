'use client';

import * as React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Plus,
  Receipt,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDateTime, timeAgo } from '@/lib/utils';
import { CashMovementDialog } from './cash-movement-dialog';
import { CloseCashDialog } from './close-cash-dialog';
import type { CurrentCashRegister } from '@/actions/cash';

export function CashDetail({ data }: { data: CurrentCashRegister }) {
  const [movementOpen, setMovementOpen] = React.useState(false);
  const [closeOpen, setCloseOpen] = React.useState(false);

  const stats = [
    {
      label: 'Apertura',
      value: formatCurrency(data.openingAmount),
      icon: Wallet,
      color: 'text-muted-foreground bg-muted',
    },
    {
      label: 'Ventas (efectivo)',
      value: formatCurrency(data.totalSalesCash),
      icon: ShoppingCart,
      color: 'text-primary bg-primary/15',
    },
    {
      label: 'Ingresos extra',
      value: formatCurrency(data.totalIncome),
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-500/15',
    },
    {
      label: 'Egresos',
      value: formatCurrency(data.totalExpense),
      icon: TrendingDown,
      color: 'text-rose-600 bg-rose-500/15',
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header card destacada */}
        <Card className="overflow-hidden">
          <div className="bg-industrial-black p-6 text-white">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge className="bg-emerald-500 text-white">CAJA ABIERTA</Badge>
                  <code className="font-mono text-xs text-white/60">{data.code}</code>
                </div>
                <p className="text-xs text-white/60">
                  <Clock className="mr-1 inline h-3 w-3" />
                  Abierta {timeAgo(data.openedAt)} por {data.userName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-white/60">Esperado en caja</p>
                <p className="font-mono text-3xl font-bold sm:text-4xl">
                  {formatCurrency(data.expectedAmount)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => setMovementOpen(true)} variant="secondary">
                <Plus className="h-4 w-4" />
                Movimiento manual
              </Button>
              <Button onClick={() => setCloseOpen(true)} variant="destructive">
                <Receipt className="h-4 w-4" />
                Cerrar caja
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1 truncate font-mono text-lg font-bold">{s.value}</p>
                  </div>
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', s.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Resumen ventas */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Ventas registradas</p>
              <p className="text-xs text-muted-foreground">
                Total de transacciones cobradas en esta caja
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{data.salesCount}</p>
              <p className="text-xs text-muted-foreground">ventas</p>
            </div>
          </div>
        </Card>

        {/* Movimientos */}
        <Card>
          <div className="border-b p-4">
            <p className="font-semibold">Movimientos manuales</p>
            <p className="text-xs text-muted-foreground">
              Ingresos y egresos registrados en la caja
            </p>
          </div>
          {data.movements.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Sin movimientos manuales aún
            </div>
          ) : (
            <ul className="divide-y">
              {data.movements.map((m) => (
                <li key={m.id} className="flex items-center gap-3 p-4">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                      m.type === 'INCOME'
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-rose-500/15 text-rose-600',
                    )}
                  >
                    {m.type === 'INCOME' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(m.createdAt)} {m.notes && `· ${m.notes}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'font-mono font-semibold',
                      m.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {m.type === 'INCOME' ? '+' : '−'}
                    {formatCurrency(m.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <CashMovementDialog open={movementOpen} onOpenChange={setMovementOpen} />
      <CloseCashDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        expectedAmount={data.expectedAmount}
      />
    </>
  );
}
