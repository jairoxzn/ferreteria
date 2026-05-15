'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { cn, formatCurrency } from '@/lib/utils';
import { ProductRowActions } from './product-row-actions';
import type { ProductRow } from '@/actions/products';

interface CreateColumnsArgs {
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function createProductColumns({
  categories,
  suppliers,
}: CreateColumnsArgs): ColumnDef<ProductRow>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Producto" />,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-muted">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Package className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{p.name}</p>
              <div className="flex items-center gap-1.5">
                <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                {p.brand && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <p className="truncate text-xs text-muted-foreground">{p.brand}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'categoryName',
      header: 'Categoría',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="font-normal"
          style={
            row.original.categoryColor
              ? {
                  borderColor: `${row.original.categoryColor}55`,
                  color: row.original.categoryColor,
                }
              : undefined
          }
        >
          {row.original.categoryName}
        </Badge>
      ),
    },
    {
      accessorKey: 'salePrice',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
      cell: ({ row }) => (
        <div className="font-mono">
          <p className="font-semibold">{formatCurrency(row.original.salePrice)}</p>
          <p className="text-[10px] text-muted-foreground">
            costo {formatCurrency(row.original.purchasePrice)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
      cell: ({ row }) => {
        const p = row.original;
        const critical = p.stock <= p.minStock;
        const veryLow = p.stock < p.minStock / 2;
        return (
          <div>
            <Badge
              variant={veryLow ? 'destructive' : critical ? 'warning' : 'outline'}
              className="font-mono"
            >
              {p.stock} {p.unit}
            </Badge>
            <p className="mt-0.5 text-[10px] text-muted-foreground">mín {p.minStock}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={
              s === 'ACTIVE' ? 'success' : s === 'INACTIVE' ? 'secondary' : 'destructive'
            }
            className={cn(s === 'DISCONTINUED' && 'opacity-70')}
          >
            {s === 'ACTIVE' ? 'Activo' : s === 'INACTIVE' ? 'Inactivo' : 'Discontinuado'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ProductRowActions
          product={row.original}
          categories={categories}
          suppliers={suppliers}
        />
      ),
    },
  ];
}
