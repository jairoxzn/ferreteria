'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { MovementType } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import type { MovementRow } from '@/actions/inventory';

const TYPE_CONFIG: Record<
  MovementType,
  { label: string; icon: typeof ArrowDownLeft; color: string; bg: string }
> = {
  IN: { label: 'Entrada', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
  OUT: { label: 'Salida', icon: ArrowUpRight, color: 'text-rose-600', bg: 'bg-rose-500/15' },
  ADJUSTMENT: { label: 'Ajuste', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-500/15' },
  SALE: { label: 'Venta', icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/15' },
  RETURN: { label: 'Devolución', icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-500/15' },
};

export const movementColumns: ColumnDef<MovementRow>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const cfg = TYPE_CONFIG[row.original.type];
      const Icon = cfg.icon;
      return (
        <div className="flex items-center gap-2">
          <div className={cn('flex h-7 w-7 items-center justify-center rounded', cfg.bg)}>
            <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
          </div>
          <span className="text-xs font-medium">{cfg.label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'productName',
    header: 'Producto',
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.productName}</p>
        <p className="font-mono text-xs text-muted-foreground">{row.original.productSku}</p>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cantidad" />,
    cell: ({ row }) => {
      const m = row.original;
      const sign =
        m.type === 'IN' ? '+' : m.type === 'OUT' || m.type === 'SALE' ? '−' : '';
      const color =
        m.type === 'IN'
          ? 'text-emerald-600'
          : m.type === 'OUT' || m.type === 'SALE'
            ? 'text-rose-600'
            : 'text-foreground';
      return (
        <div className="font-mono">
          <p className={cn('font-semibold', color)}>
            {sign}
            {m.quantity}
          </p>
          {m.unitCost !== null && (
            <p className="text-[10px] text-muted-foreground">
              {formatCurrency(m.unitCost)}/u
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'stockAfter',
    header: 'Stock',
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        <span className="text-muted-foreground">{row.original.stockBefore}</span>
        <span className="mx-1 text-muted-foreground">→</span>
        <strong>{row.original.stockAfter}</strong>
      </div>
    ),
  },
  {
    accessorKey: 'reference',
    header: 'Referencia',
    cell: ({ row }) => (
      <div className="max-w-[180px]">
        {row.original.reference && (
          <p className="truncate font-mono text-xs">{row.original.reference}</p>
        )}
        {row.original.supplierName && (
          <p className="truncate text-xs text-muted-foreground">{row.original.supplierName}</p>
        )}
        {row.original.notes && (
          <p className="truncate text-xs text-muted-foreground">{row.original.notes}</p>
        )}
        {!row.original.reference && !row.original.supplierName && !row.original.notes && (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'userName',
    header: 'Usuario',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {row.original.userName}
      </Badge>
    ),
  },
];
