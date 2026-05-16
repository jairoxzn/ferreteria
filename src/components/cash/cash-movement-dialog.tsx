'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cashMovementSchema, type CashMovementInput } from '@/lib/validations/cash';
import { addCashMovement } from '@/actions/cash';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function CashMovementDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<CashMovementInput>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: { type: 'INCOME', amount: 0, reason: '', notes: '' },
  });

  React.useEffect(() => {
    if (open) form.reset({ type: 'INCOME', amount: 0, reason: '', notes: '' });
  }, [open, form]);

  const type = form.watch('type');

  const onSubmit = (values: CashMovementInput) => {
    startTransition(async () => {
      const res = await addCashMovement(values);
      if (res.ok) {
        toast.success(values.type === 'INCOME' ? 'Ingreso registrado' : 'Egreso registrado');
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
          <DialogTitle>Movimiento de caja</DialogTitle>
          <DialogDescription>Registra ingresos o egresos manuales de efectivo</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              value={type}
              onValueChange={(v) => form.setValue('type', v as 'INCOME' | 'EXPENSE')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="INCOME">Ingreso</TabsTrigger>
                <TabsTrigger value="EXPENSE">Egreso</TabsTrigger>
              </TabsList>
            </Tabs>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto *</FormLabel>
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
                        className="pl-8 font-mono"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={type === 'INCOME' ? 'Préstamo, devolución...' : 'Gasto operativo, viático...'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalle opcional" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
