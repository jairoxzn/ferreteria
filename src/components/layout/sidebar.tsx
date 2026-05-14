'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsLeft, Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { navigation } from './sidebar-nav';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

type AppRole = 'ADMIN' | 'VENDEDOR' | 'ALMACEN';

interface SidebarProps {
  role: AppRole;
}

export function Sidebar({ role }: SidebarProps) {
  const { collapsed, toggle } = useSidebarStore();
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 76 : 264 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Hammer className="h-5 w-5" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-sm font-bold tracking-tight">Ferretería Pro</span>
                <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                  Inventory Suite
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          {navigation.map((group) => {
            const items = group.items.filter(
              (item) => !item.roles || item.roles.includes(role),
            );
            if (items.length === 0) return null;

            return (
              <div key={group.label} className="mb-5">
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40"
                    >
                      {group.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                <ul className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(item.href + '/');
                    const link = (
                      <Link
                        href={item.href}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                          active
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                          collapsed && 'justify-center',
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="active-pill"
                            className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                            transition={{ duration: 0.2 }}
                          />
                        )}
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <Badge variant="outline" className="h-5 border-primary/30 text-[10px] text-primary">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    );

                    return (
                      <li key={item.href}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                            <TooltipContent side="right">{item.title}</TooltipContent>
                          </Tooltip>
                        ) : (
                          link
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer / collapse btn */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={toggle}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Colapsar sidebar"
          >
            <ChevronsLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
            {!collapsed && <span className="text-xs">Colapsar</span>}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
