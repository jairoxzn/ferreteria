'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownLeft, ArrowUpRight, Loader2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import {
  movementSchema,
  adjustmentSchema,
  type MovementInput,
  type AdjustmentInput,
} from '@/lib/validations/inventory';
import { createMovement, createAdjustment } from '@/actions/inventory';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface Option {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: { id: string; name: string; sku: string; stock: number }[];
  suppliers: Option[];
  defaultProductId?: string;
}

export function MovementFormDialog({
  open,
  onOpenChange,
  products,
  suppliers,
  defaultProductId,
}: Props) {
  const [tab, setTab] = React.useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Movimiento de inventario</DialogTitle>
          <DialogDescription>
            Registra entradas, salidas o ajustes de stock con auditoría completa
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="IN" className="gap-2">
              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline">Entrada</span>
            </TabsTrigger>
            <TabsTrigger value="OUT" className="gap-2">
              <ArrowUpRight className="h-4 w-4 text-rose-500" />
              <span className="hidden sm:inline">Salida</span>
            </TabsTrigger>
            <TabsTrigger value="ADJUSTMENT" className="gap-2">
              <Wrench className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline">Ajuste</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="IN">
            <MovementForm
              type="IN"
              products={products}
              suppliers={suppliers}
              defaultProductId={defaultProductId}
              onSuccess={() => onOpenChange(false)}
            />
          </TabsContent>
          <TabsContent value="OUT">
            <MovementForm
              type="OUT"
              products={products}
              suppliers={[]}
              defaultProductId={defaultProductId}
              onSuccess={() => onOpenChange(false)}
            />
          </TabsContent>
          <TabsContent value="ADJUSTMENT">
            <AdjustmentForm
              products={products}
              defaultProductId={defaultProductId}
              onSuccess={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface MovementFormProps {
  type: 'IN' | 'OUT';
  products: { id: string; name: string; sku: string; stock: number }[];
  suppliers: Option[];
  defaultProductId?: string;
  onSuccess: () => void;
}

function MovementForm({ type, products, suppliers, defaultProductId, onSuccess }: MovementFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<MovementInput>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: defaultProductId ?? '',
      type,
      quantity: 1,
      unitCost: undefined,
      reference: '',
      supplierId: '',
      notes: '',
    },
  });

  const productId = form.watch('productId');
  const selectedProduct = products.find((p) => p.id === productId);

  const onSubmit = (values: MovementInput) => {
    startTransition(async () => {
      const res = await createMovement({ ...values, type });
      if (res.ok) {
        toast.success(type === 'IN' ? 'Entrada registrada' : 'Salida registrada');
        form.reset({
          productId: '',
          type,
          quantity: 1,
          unitCost: undefined,
          reference: '',
          supplierId: '',
          notes: '',
        });
        onSuccess();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-mono text-xs">{p.sku}</span> · {p.name} ({p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <FormDescription>
                  Stock actual: <strong>{selectedProduct.stock}</strong>
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad *</FormLabel>
                <FormControl>
                  <Input type="number" min="1" className="font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {type === 'IN' && (
            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo unitario</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        S/
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-8 font-mono"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {type === 'IN' && suppliers.length > 0 && (
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === '__none' ? '' : v)}
                  value={field.value || '__none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">— Sin proveedor —</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia</FormLabel>
              <FormControl>
                <Input placeholder="N° guía, factura, orden..." {...field} />
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
                <Textarea placeholder="Detalles adicionales" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar {type === 'IN' ? 'entrada' : 'salida'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

interface AdjustmentFormProps {
  products: { id: string; name: string; sku: string; stock: number }[];
  defaultProductId?: string;
  onSuccess: () => void;
}

function AdjustmentForm({ products, defaultProductId, onSuccess }: AdjustmentFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<AdjustmentInput>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { productId: defaultProductId ?? '', newStock: 0, reason: '' },
  });

  const productId = form.watch('productId');
  const newStock = form.watch('newStock');
  const selectedProduct = products.find((p) => p.id === productId);
  const delta = selectedProduct ? newStock - selectedProduct.stock : 0;

  const onSubmit = (values: AdjustmentInput) => {
    startTransition(async () => {
      const res = await createAdjustment(values);
      if (res.ok) {
        toast.success('Stock ajustado');
        form.reset({ productId: '', newStock: 0, reason: '' });
        onSuccess();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-mono text-xs">{p.sku}</span> · {p.name} ({p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nuevo stock *</FormLabel>
              <FormControl>
                <Input type="number" min="0" className="font-mono" {...field} />
              </FormControl>
              {selectedProduct && delta !== 0 && (
                <FormDescription>
                  Cambio: <strong className={delta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {delta > 0 ? '+' : ''}{delta} unidades
                  </strong> (de {selectedProduct.stock} a {newStock})
                </FormDescription>
              )}
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
                <Textarea
                  placeholder="Conteo físico, merma, daño, error de registro..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>Queda auditado en el kardex</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Aplicar ajuste
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
