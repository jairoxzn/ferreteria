'use client';

import * as React from 'react';
import Image from 'next/image';
import { Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';

export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  unit: string;
  salePrice: number;
  stock: number;
  image: string | null;
  categoryName: string;
}

interface Props {
  products: POSProduct[];
}

export function ProductSearchPanel({ products }: Props) {
  const [query, setQuery] = React.useState('');
  const addItem = useCartStore((s) => s.addItem);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b bg-background/95 p-3 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Buscar por nombre, SKU o categoría..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length} producto{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">Sin resultados</p>
            <p className="text-xs text-muted-foreground">Prueba con otro término</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((p) => {
              const disabled = p.stock < 1;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    addItem({
                      productId: p.id,
                      name: p.name,
                      sku: p.sku,
                      unit: p.unit,
                      unitPrice: p.salePrice,
                      stock: p.stock,
                    })
                  }
                  disabled={disabled}
                  className={cn(
                    'group flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-all',
                    'hover:border-primary hover:shadow-md',
                    disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:shadow-none',
                  )}
                >
                  <div className="relative aspect-square w-full bg-muted">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="160px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                    <Badge
                      variant={p.stock === 0 ? 'destructive' : p.stock < 5 ? 'warning' : 'secondary'}
                      className="absolute right-1.5 top-1.5 text-[10px]"
                    >
                      {p.stock}
                    </Badge>
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-2 text-xs font-medium leading-tight">{p.name}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{p.sku}</p>
                    <p className="mt-1 font-bold text-primary">{formatCurrency(p.salePrice)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
