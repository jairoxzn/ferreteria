'use client';

import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertOctagon className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-destructive">Error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Algo salió mal</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Ocurrió un error inesperado. Intenta de nuevo o vuelve más tarde.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">ID: {error.digest}</p>
        )}
        <Button onClick={() => reset()} className="mt-8">
          <RotateCcw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}
