'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Shield, ShoppingCart, Warehouse } from 'lucide-react';
import { Role } from '@prisma/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { timeAgo } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import { UserRowActions } from './user-row-actions';
import type { UserRow } from '@/actions/users';

const ROLE_CONFIG: Record<Role, { icon: typeof Shield; color: string }> = {
  ADMIN: { icon: Shield, color: 'bg-primary/15 text-primary' },
  VENDEDOR: { icon: ShoppingCart, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  ALMACEN: { icon: Warehouse, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
};

export function createUserColumns(currentUserId: string): ColumnDef<UserRow>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Usuario" />,
      cell: ({ row }) => {
        const u = row.original;
        const initials = u.name
          .split(' ')
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-medium">
                {u.name}
                {u.id === currentUserId && (
                  <Badge variant="outline" className="text-[9px]">
                    Tú
                  </Badge>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const cfg = ROLE_CONFIG[row.original.role];
        const Icon = cfg.icon;
        return (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className={`flex h-4 w-4 items-center justify-center rounded ${cfg.color}`}>
              <Icon className="h-2.5 w-2.5" />
            </span>
            {ROLE_LABELS[row.original.role]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.phone || '—'}</span>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Último acceso',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.lastLogin ? timeAgo(row.original.lastLogin) : 'Nunca'}
        </span>
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
      cell: ({ row }) => <UserRowActions user={row.original} currentUserId={currentUserId} />,
    },
  ];
}
