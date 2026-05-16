'use client';

import * as React from 'react';
import { MoreHorizontal, Pencil, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserFormDialog } from './user-form-dialog';
import { toggleUserActive, type UserRow } from '@/actions/users';

export function UserRowActions({ user, currentUserId }: { user: UserRow; currentUserId: string }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [, startTransition] = React.useTransition();
  const isSelf = user.id === currentUserId;

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleUserActive(user.id);
      if (res.ok) toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado');
      else toast.error(res.error);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle} disabled={isSelf}>
            <Power className="h-4 w-4" />
            {user.active ? 'Desactivar' : 'Activar'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserFormDialog open={editOpen} onOpenChange={setEditOpen} user={user} />
    </>
  );
}
