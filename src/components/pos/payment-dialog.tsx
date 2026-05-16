'use client';

import * as React from 'react';
import { Banknote, CreditCard, Loader2, Smartphone, Building2, X } from 'lucide-react';
import { PaymentMethod } from '@prisma/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import { selectTotals, useCartStore } from '@/stores/cart-store';
import { createSale } from '@/actions/sales';
import { PAYMENT_METHODS } from '@/lib/constants';

interface PaymentLine {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference: string;
}

const METHOD_ICONS: Record<PaymentMethod, typeof Banknote> = {
  EFECTIVO: Banknote,
  TARJETA: CreditCard,
  YAPE: Smartphone,
  PLIN: Smartphone,
  TRANSFERENCIA: Building2,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (saleId: string, saleCode: string) => void;
}

export function PaymentDialog({ open, onOpenChange, onSuccess }: Props) {
  const items = useCartStore((s) => s.items);
  const customerId = useCartStore((s) => s.customerId);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const taxRate = useCartStore((s) => s.taxRate);
  const notes = useCartStore((s) => s.notes);
  const clear = useCartStore((s) => s.clear);
  const totals = useCartStore(selectTotals);

  const [payments, setPayments] = React.useState<PaymentLine[]>([]);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (open) {
      setPayments([
        {
          id: crypto.randomUUID(),
          method: 'EFECTIVO',
          amount: totals.total,
          reference: '',
        },
      ]);
    }
  }, [open, totals.total]);

  const paid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = totals.total - paid;
  const change = paid > totals.total ? paid - totals.total : 0;
  const canSubmit = Math.abs(remaining) < 0.01 || paid >= totals.total;

  const addLine = (method: PaymentMethod) => {
    setPayments((s) => [
      ...s,
      {
        id: crypto.randomUUID(),
        method,
        amount: Math.max(0, remaining),
        reference: '',
      },
    ]);
  };

  const updateLine = (id: string, patch: Partial<PaymentLine>) => {
    setPayments((s) => s.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeLine = (id: string) => setPayments((s) => s.filter((p) => p.id !== id));

  const handleConfirm = () => {
    if (!canSubmit) return;
    startTransition(async () => {
      // Ajustar el último pago EFECTIVO para descontar el vuelto
      const adjusted = payments.map((p) => ({ ...p }));
      if (change > 0) {
        const lastCash = [...adjusted].reverse().find((p) => p.method === 'EFECTIVO');
        if (lastCash) lastCash.amount -= change;
      }

      const res = await createSale({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
        })),
        payments: adjusted.map((p) => ({
          method: p.method,
          amount: p.amount,
          reference: p.reference,
        })),
        customerId,
        discountAmount,
        taxRate,
        notes,
      });

      if (res.ok && 'data' in res && res.data) {
        toast.success(`Venta ${res.data.code} registrada`);
        const { id, code } = res.data;
        clear();
        onOpenChange(false);
        onSuccess(id, code);
      } else {
        toast.error('error' in res ? res.error : 'Error');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-thin sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Cobrar venta</DialogTitle>
          <DialogDescription>Registra los métodos de pago para completar la venta</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <div className="rounded-lg border bg-primary/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total a cobrar</p>
            <p className="mt-1 font-mono text-4xl font-bold text-primary">
              {formatCurrency(totals.total)}
            </p>
          </div>

          {/* Payment lines */}
          <div className="space-y-2">
            {payments.map((p) => {
              const Icon = METHOD_ICONS[p.method];
              return (
                <div key={p.id} className="rounded-lg border p-3">
                  <div className="grid grid-cols-[auto,1fr,auto] gap-2">
                    <div className="grid grid-cols-5 gap-1">
                      {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => {
                        const MIcon = METHOD_ICONS[m];
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => updateLine(p.id, { method: m })}
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
                              p.method === m
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input hover:bg-accent',
                            )}
                            title={PAYMENT_METHODS[m]}
                          >
                            <MIcon className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={p.amount}
                      onChange={(e) =>
                        updateLine(p.id, { amount: parseFloat(e.target.value) || 0 })
                      }
                      className="font-mono"
                    />
                    {payments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(p.id)}
                        className="h-9 w-9"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {p.method !== 'EFECTIVO' && (
                    <Input
                      placeholder={`N° operación / referencia ${PAYMENT_METHODS[p.method]}`}
                      value={p.reference}
                      onChange={(e) => updateLine(p.id, { reference: e.target.value })}
                      className="mt-2 text-xs"
                    />
                  )}
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {PAYMENT_METHODS[p.method]}
                  </p>
                </div>
              );
            })}

            {remaining > 0.01 && (
              <Button
                variant="outline"
                onClick={() => addLine('EFECTIVO')}
                className="w-full"
              >
                + Agregar otro método de pago
              </Button>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between">
              <Label className="font-normal text-muted-foreground">Recibido:</Label>
              <span className="font-mono">{formatCurrency(paid)}</span>
            </div>
            {remaining > 0.01 && (
              <div className="flex justify-between text-rose-600">
                <Label className="font-normal">Falta:</Label>
                <span className="font-mono font-bold">{formatCurrency(remaining)}</span>
              </div>
            )}
            {change > 0.01 && (
              <div className="flex justify-between text-emerald-600">
                <Label className="font-normal">Vuelto:</Label>
                <span className="font-mono font-bold">{formatCurrency(change)}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
