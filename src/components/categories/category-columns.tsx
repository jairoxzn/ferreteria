'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Layers, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { formatDate } from '@/lib/utils';
import { CategoryRowActions } from './category-row-actions';
import type { CategoryRow } from '@/actions/categories';

export const categoryColumns: ColumnDef<CategoryRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    cell: ({ row }) => {
      const cat = row.original;
      return (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white"
            style={{ background: cat.color ?? 'hsl(var(--muted))' }}
          >
            <Layers className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{cat.name}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{cat.slug}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
    cell: ({ row }) => (
      <p className="max-w-xs truncate text-sm text-muted-foreground">
        {row.original.description || '—'}
      </p>
    ),
  },
  {
    accessorKey: 'productCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Productos" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        <Package className="mr-1 h-3 w-3" />
        {row.original.productCount}
      </Badge>
    ),
  },
  {
    accessorKey: 'active',
    header: 'Estado',
    cell: ({ row }) =>
      row.original.active ? (
        <Badge variant="success">Activo</Badge>
      ) : (
        <Badge variant="secondary">Inactivo</Badge>
      ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Creada" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CategoryRowActions category={row.original} />,
  },
];
