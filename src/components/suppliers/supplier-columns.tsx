'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Building2, Mail, Package, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { SupplierRowActions } from './supplier-row-actions';
import type { SupplierRow } from '@/actions/suppliers';

export const supplierColumns: ColumnDef<SupplierRow>[] = [
  {
    accessorKey: 'company',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Empresa" />,
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{s.company}</p>
            <p className="font-mono text-xs text-muted-foreground">RUC {s.ruc}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'contact',
    header: 'Contacto',
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="space-y-0.5 text-xs">
          {s.contact && <p className="font-medium text-foreground">{s.contact}</p>}
          {s.phone && (
            <p className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              {s.phone}
            </p>
          )}
          {s.email && (
            <p className="flex items-center gap-1 truncate text-muted-foreground">
              <Mail className="h-3 w-3" />
              {s.email}
            </p>
          )}
          {!s.contact && !s.phone && !s.email && <p className="text-muted-foreground">—</p>}
        </div>
      );
    },
  },
  {
    accessorKey: 'city',
    header: 'Ciudad',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.city || '—'}</span>
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
    id: 'actions',
    cell: ({ row }) => <SupplierRowActions supplier={row.original} />,
  },
];
