'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hammer, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { navigation } from './sidebar-nav';
import { Badge } from '@/components/ui/badge';

type AppRole = 'ADMIN' | 'VENDEDOR' | 'ALMACEN';

export function MobileSidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-r-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetTitle className="sr-only">Navegación</SheetTitle>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Ferretería Pro</p>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
              Inventory Suite
            </p>
          </div>
        </div>

        <nav className="scrollbar-thin h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
          {navigation.map((group) => {
            const items = group.items.filter(
              (item) => !item.roles || item.roles.includes(role),
            );
            if (items.length === 0) return null;
            return (
              <div key={group.label} className="mb-5">
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            active
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="h-5 border-primary/30 text-[10px] text-primary">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
