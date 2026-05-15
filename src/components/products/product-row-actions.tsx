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
import { ProductFormDialog } from './product-form-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { deleteProduct, toggleProductStatus, type ProductRow } from '@/actions/products';

interface Props {
  product: ProductRow;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function ProductRowActions({ product, categories, suppliers }: Props) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [, startTransition] = React.useTransition();

  const handleToggle = () => {
    const next = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    startTransition(async () => {
      const res = await toggleProductStatus(product.id, next);
      if (res.ok) toast.success(next === 'ACTIVE' ? 'Producto activado' : 'Producto desactivado');
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
            {product.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
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

      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        product={product}
        categories={categories}
        suppliers={suppliers}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar producto?"
        description={`"${product.name}" será eliminado permanentemente. Si tiene ventas asociadas, considera desactivarlo en su lugar.`}
        onConfirm={() => deleteProduct(product.id)}
      />
    </>
  );
}
