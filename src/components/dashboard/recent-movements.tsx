'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Wrench,
  ShoppingCart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, timeAgo } from '@/lib/utils';
import type { RecentMovement } from '@/actions/dashboard';
import type { MovementType } from '@prisma/client';

const MOVEMENT_CONFIG: Record<MovementType, { label: string; icon: typeof Activity; color: string }> = {
  IN: { label: 'Entrada', icon: ArrowDownLeft, color: 'text-emerald-500 bg-emerald-500/10' },
  OUT: { label: 'Salida', icon: ArrowUpRight, color: 'text-rose-500 bg-rose-500/10' },
  ADJUSTMENT: { label: 'Ajuste', icon: Wrench, color: 'text-amber-500 bg-amber-500/10' },
  SALE: { label: 'Venta', icon: ShoppingCart, color: 'text-primary bg-primary/15' },
  RETURN: { label: 'Devolución', icon: RotateCcw, color: 'text-blue-500 bg-blue-500/10' },
};

interface Props {
  movements: RecentMovement[];
}

export function RecentMovements({ movements }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Últimos movimientos
        </CardTitle>
        <CardDescription>Actividad reciente de inventario</CardDescription>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">Sin movimientos</p>
            <p className="text-xs text-muted-foreground">
              Los registros aparecerán aquí cuando ocurran
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {movements.map((m) => {
              const cfg = MOVEMENT_CONFIG[m.type];
              const Icon = cfg.icon;
              return (
                <li key={m.id} className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', cfg.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cfg.label} · {m.userName} · {timeAgo(m.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'font-mono text-sm font-semibold',
                      m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {m.type === 'IN' ? '+' : '−'}
                    {m.quantity}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
