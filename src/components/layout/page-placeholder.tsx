'use client';

import { motion } from 'framer-motion';
import { Construction, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PagePlaceholderProps {
  title: string;
  description: string;
  features: string[];
}

export function PagePlaceholder({ title, description, features }: PagePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="overflow-hidden p-10">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Construction className="h-8 w-8" />
          </div>
          <Badge variant="outline" className="mb-3">
            <Sparkles className="mr-1 h-3 w-3" />
            En desarrollo · Fase 2
          </Badge>
          <h2 className="text-xl font-bold">Módulo próximamente</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Este módulo será habilitado en la siguiente fase de desarrollo.
          </p>

          <div className="mt-6 w-full">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Funcionalidades planificadas
            </p>
            <ul className="space-y-2 text-left text-sm">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
