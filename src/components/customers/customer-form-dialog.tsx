'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { customerSchema, type CustomerInput } from '@/lib/validations/customer';
import {
  createCustomer,
  updateCustomer,
  type CustomerRow,
} from '@/actions/customers';
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerRow | null;
  onCreated?: (customer: { id: string; name: string }) => void;
}

export function CustomerFormDialog({ open, onOpenChange, customer, onCreated }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!customer;

  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        customer
          ? {
              name: customer.name,
              document: customer.document ?? '',
              email: customer.email ?? '',
              phone: customer.phone ?? '',
              address: customer.address ?? '',
              notes: customer.notes ?? '',
            }
          : {
              name: '',
              document: '',
              email: '',
              phone: '',
              address: '',
              notes: '',
            },
      );
    }
  }, [open, customer, form]);

  const onSubmit = (values: CustomerInput) => {
    startTransition(async () => {
      if (isEdit) {
        const res = await updateCustomer(customer!.id, values);
        if (res.ok) {
          toast.success('Cliente actualizado');
          onOpenChange(false);
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await createCustomer(values);
        if (res.ok) {
          toast.success('Cliente creado');
          if (res.data && onCreated) onCreated(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modifica los datos del cliente' : 'Registra un cliente para historial'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI / RUC</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="12345678"
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Lima 123" {...field} />
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
                    <Textarea placeholder="Información adicional" rows={2} {...field} />
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
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Guardar' : 'Crear cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
