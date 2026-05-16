'use client';

import Link from 'next/link';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function NoCashWarning() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-industrial-black p-10 text-white">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Necesitas abrir caja</h2>
          <p className="mt-2 text-sm text-white/60">
            Para registrar ventas debes tener una caja abierta. Esto permite controlar el flujo
            de efectivo y hacer el arqueo del día.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/caja">
              <DollarSign className="h-4 w-4" />
              Ir a caja
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
