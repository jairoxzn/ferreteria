'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LowStockProduct } from '@/actions/dashboard';

interface Props {
  products: LowStockProduct[];
}

export function LowStockAlert({ products }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Alerta de stock
            </CardTitle>
            <CardDescription>Productos por reponer urgentemente</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/inventario">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-2 h-10 w-10 text-emerald-500" />
            <p className="text-sm font-medium">¡Todo en orden!</p>
            <p className="text-xs text-muted-foreground">No hay productos en stock crítico</p>
          </div>
        ) : (
          <ul className="divide-y">
            {products.map((p) => {
              const ratio = p.minStock > 0 ? p.stock / p.minStock : 0;
              const critical = ratio < 0.5;
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={critical ? 'destructive' : 'warning'}
                      className={cn('font-mono', critical && 'animate-pulse')}
                    >
                      {p.stock} / {p.minStock}
                    </Badge>
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
