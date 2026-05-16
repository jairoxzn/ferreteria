'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { closeCashSchema, type CloseCashInput } from '@/lib/validations/cash';
import { closeCashRegister } from '@/actions/cash';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expectedAmount: number;
}

export function CloseCashDialog({ open, onOpenChange, expectedAmount }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<CloseCashInput>({
    resolver: zodResolver(closeCashSchema),
    defaultValues: { closingAmount: expectedAmount, notes: '' },
  });

  React.useEffect(() => {
    if (open) form.reset({ closingAmount: expectedAmount, notes: '' });
  }, [open, expectedAmount, form]);

  const closingAmount = form.watch('closingAmount');
  const difference = closingAmount - expectedAmount;

  const onSubmit = (values: CloseCashInput) => {
    startTransition(async () => {
      const res = await closeCashRegister(values);
      if (res.ok) {
        toast.success('Caja cerrada');
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
          <DialogDescription>Cuenta el efectivo físico y registra el cierre</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Esperado en caja:</span>
                <span className="font-mono font-semibold">{formatCurrency(expectedAmount)}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="closingAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto contado *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        S/
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        autoFocus
                        className="pl-8 font-mono text-lg"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className={cn(
                'flex items-center justify-between rounded-lg border p-3 text-sm',
                difference === 0 && 'border-emerald-500/40 bg-emerald-500/5',
                difference > 0 && 'border-blue-500/40 bg-blue-500/5',
                difference < 0 && 'border-rose-500/40 bg-rose-500/5',
              )}
            >
              <span className="font-medium">Diferencia:</span>
              <span
                className={cn(
                  'font-mono font-bold',
                  difference === 0 && 'text-emerald-600',
                  difference > 0 && 'text-blue-600',
                  difference < 0 && 'text-rose-600',
                )}
              >
                {difference > 0 && '+'}
                {formatCurrency(difference)}
              </span>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de cierre</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explica diferencias o incidencias"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} variant="destructive">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Cerrar caja
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
