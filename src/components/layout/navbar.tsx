'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './theme-toggle';
import { MobileSidebar } from './mobile-sidebar';
import { UserMenu } from './user-menu';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: 'ADMIN' | 'VENDEDOR' | 'ALMACEN';
  };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <MobileSidebar role={user.role} />

      <div className="relative hidden flex-1 max-w-xl md:flex">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar productos, ventas, clientes..."
          className="h-9 pl-9 bg-muted/40 border-transparent focus-visible:bg-background"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:flex">
          <span>⌘</span>K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute right-1.5 top-1.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
            3
          </Badge>
        </Button>
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-border" />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
