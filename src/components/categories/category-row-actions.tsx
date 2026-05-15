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
import { CategoryFormDialog } from './category-form-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { deleteCategory, toggleCategoryActive, type CategoryRow } from '@/actions/categories';

export function CategoryRowActions({ category }: { category: CategoryRow }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [, startTransition] = React.useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCategoryActive(category.id);
      if (res.ok) toast.success(category.active ? 'Categoría desactivada' : 'Categoría activada');
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
            {category.active ? 'Desactivar' : 'Activar'}
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

      <CategoryFormDialog open={editOpen} onOpenChange={setEditOpen} category={category} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar categoría?"
        description={`"${category.name}" será eliminada permanentemente. Esta acción no se puede deshacer.`}
        onConfirm={() => deleteCategory(category.id)}
      />
    </>
  );
}
