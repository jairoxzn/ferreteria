'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categorySchema, type CategoryInput } from '@/lib/validations/category';
import { createCategory, updateCategory, type CategoryRow } from '@/actions/categories';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryRow | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!category;

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: '#FACC15',
      active: true,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        category
          ? {
              name: category.name,
              description: category.description ?? '',
              icon: category.icon ?? '',
              color: category.color ?? '#FACC15',
              active: category.active,
            }
          : {
              name: '',
              description: '',
              icon: '',
              color: '#FACC15',
              active: true,
            },
      );
    }
  }, [open, category, form]);

  const onSubmit = (values: CategoryInput) => {
    startTransition(async () => {
      const res = isEdit
        ? await updateCategory(category!.id, values)
        : await createCategory(values);

      if (res.ok) {
        toast.success(isEdit ? 'Categoría actualizada' : 'Categoría creada');
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
          <DialogTitle>{isEdit ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la categoría'
              : 'Crea una nueva categoría para organizar tus productos'}
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
                    <Input placeholder="Ej. Herramientas eléctricas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción de la categoría"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono</FormLabel>
                    <FormControl>
                      <Input placeholder="Wrench" {...field} />
                    </FormControl>
                    <FormDescription>Nombre de Lucide</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value || '#FACC15'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-12 cursor-pointer rounded-md border bg-background"
                        />
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder="#FACC15"
                          className="font-mono uppercase"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Categoría activa</FormLabel>
                    <FormDescription>Visible en el catálogo y POS</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
                {isEdit ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
