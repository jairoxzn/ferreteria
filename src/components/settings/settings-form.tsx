'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileText, Loader2, Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { settingsSchema, type SettingsInput } from '@/lib/validations/settings';
import { updateSettings, type SettingsData } from '@/actions/settings';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/common/image-upload';

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: initial.companyName ?? '',
      ruc: initial.ruc ?? '',
      address: initial.address ?? '',
      phone: initial.phone ?? '',
      email: initial.email ?? '',
      logo: initial.logo ?? '',
      igv: initial.igv,
      currency: initial.currency,
      ticketHeader: initial.ticketHeader ?? '',
      ticketFooter: initial.ticketFooter ?? '',
    },
  });

  const onSubmit = (values: SettingsInput) => {
    startTransition(async () => {
      const res = await updateSettings(values);
      if (res.ok) toast.success('Configuración guardada');
      else toast.error(res.error);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Empresa */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Datos de la empresa</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-[180px,1fr]">
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(url) => field.onChange(url ?? '')}
                      folder="company"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón social</FormLabel>
                      <FormControl>
                        <Input placeholder="Mi Ferretería SAC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ruc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          maxLength={11}
                          placeholder="20123456789"
                          className="font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Principal 123, Lima" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-3 sm:grid-cols-2">
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contacto@miferreteria.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Impuestos y moneda */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Impuestos y moneda</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="igv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa de IGV *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Como decimal: 0.18 = 18%. Aplicado en POS.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda *</FormLabel>
                  <FormControl>
                    <Input maxLength={3} className="font-mono uppercase" {...field} />
                  </FormControl>
                  <FormDescription>Código ISO: PEN, USD, EUR...</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Ticket */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Comprobante de venta</h2>
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="ticketHeader"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto superior del ticket</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Ej: ¡Bienvenido a Mi Ferretería! Síguenos en redes."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticketFooter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto inferior del ticket</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Ej: Gracias por su preferencia. No se aceptan cambios sin boleta."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
