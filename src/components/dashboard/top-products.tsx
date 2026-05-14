'use client';

import { Trophy, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TopProduct } from '@/actions/dashboard';

interface Props {
  products: TopProduct[];
}

export function TopProductsCard({ products }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Más vendidos
            </CardTitle>
            <CardDescription>Top productos por unidades</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">Sin ventas aún</p>
            <p className="text-xs text-muted-foreground">Registra tu primera venta</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {products.map((p, i) => {
              const max = products[0].sold || 1;
              const pct = (p.sold / max) * 100;
              return (
                <li key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <p className="truncate font-medium">{p.name}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                      {formatNumber(p.sold)} u.
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
