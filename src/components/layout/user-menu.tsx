'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Settings, User as UserIcon, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/lib/constants';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: 'ADMIN' | 'VENDEDOR' | 'ALMACEN';
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex h-10 items-center gap-3 rounded-full pl-1 pr-3 hover:bg-accent"
        >
          <Avatar className="h-8 w-8 border">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? ''} />}
            <AvatarFallback className="bg-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start text-left sm:flex">
            <span className="text-xs font-semibold leading-none">{user.name ?? user.email}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm">{user.name}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="h-4 w-4" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Shield className="h-4 w-4" />
          Seguridad
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="h-4 w-4" />
          Preferencias
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
