'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { formatCurrency } from '@/lib/utils';
import { CustomerRowActions } from './customer-row-actions';
import type { CustomerRow } from '@/actions/customers';

export const customerColumns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{c.name}</p>
            {c.document && (
              <p className="font-mono text-xs text-muted-foreground">{c.document}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Contacto',
    cell: ({ row }) => (
      <div className="text-xs">
        {row.original.phone && <p>{row.original.phone}</p>}
        {row.original.email && <p className="text-muted-foreground">{row.original.email}</p>}
        {!row.original.phone && !row.original.email && (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'salesCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ventas" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.salesCount}
      </Badge>
    ),
  },
  {
    accessorKey: 'totalSpent',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total comprado" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {formatCurrency(row.original.totalSpent)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CustomerRowActions customer={row.original} />,
  },
];
