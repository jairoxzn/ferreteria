import Link from 'next/link';
import { Hammer, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Hammer className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Página no encontrada</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          La ruta que buscas no existe o ha sido movida. Vuelve al panel principal para continuar.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Ir al dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
