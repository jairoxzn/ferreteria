'use client';

import * as React from 'react';
import { MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SupplierFormDialog } from './supplier-form-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { deleteSupplier, toggleSupplierActive, type SupplierRow } from '@/actions/suppliers';

export function SupplierRowActions({ supplier }: { supplier: SupplierRow }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [, startTransition] = React.useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleSupplierActive(supplier.id);
      if (res.ok) toast.success(supplier.active ? 'Proveedor desactivado' : 'Proveedor activado');
      else toast.error(res.error);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            <Power className="h-4 w-4" />
            {supplier.active ? 'Desactivar' : 'Activar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SupplierFormDialog open={editOpen} onOpenChange={setEditOpen} supplier={supplier} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar proveedor?"
        description={`"${supplier.company}" será eliminado permanentemente.`}
        onConfirm={() => deleteSupplier(supplier.id)}
      />
    </>
  );
}
