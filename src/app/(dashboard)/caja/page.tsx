import type { Metadata } from 'next';
import { DollarSign } from 'lucide-react';
import { getCurrentCashRegister } from '@/actions/cash';
import { CashDetail } from '@/components/cash/cash-detail';
import { CashClosedView } from '@/components/cash/cash-closed-view';

export const metadata: Metadata = { title: 'Caja' };
export const dynamic = 'force-dynamic';

export default async function CajaPage() {
  const current = await getCurrentCashRegister();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Caja</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Apertura, cierre y movimientos de efectivo
          </p>
        </div>
      </div>

      {current ? <CashDetail data={current} /> : <CashClosedView />}
    </div>
  );
}
