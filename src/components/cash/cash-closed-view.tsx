'use client';

import * as React from 'react';
import { DollarSign, Lock, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OpenCashDialog } from './open-cash-dialog';

export function CashClosedView() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="bg-industrial-black p-10 text-white">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Lock className="h-8 w-8 text-white/60" />
            </div>
            <h2 className="text-2xl font-bold">Caja cerrada</h2>
            <p className="mt-2 text-sm text-white/60">
              Abre la caja con tu monto inicial para empezar a registrar ventas y movimientos.
            </p>
            <Button onClick={() => setOpen(true)} className="mt-6" size="lg">
              <Play className="h-4 w-4" />
              Abrir caja ahora
            </Button>

            <div className="mt-8 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              <DollarSign className="h-3 w-3" />
              Para hacer ventas debes tener una caja abierta
            </div>
          </div>
        </div>
      </Card>

      <OpenCashDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
