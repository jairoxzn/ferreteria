'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { productSchema, type ProductInput } from '@/lib/validations/product';
import {
  createProduct,
  generateNextSku,
  updateProduct,
  type ProductRow,
} from '@/actions/products';
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
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/common/image-upload';
import { UNITS } from '@/lib/constants';

interface Option {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductRow | null;
  categories: Option[];
  suppliers: Option[];
}

export function ProductFormDialog({ open, onOpenChange, product, categories, suppliers }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const [generatingSku, setGeneratingSku] = React.useState(false);
  const isEdit = !!product;

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      image: '',
      brand: '',
      unit: 'UND',
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
      minStock: 5,
      categoryId: '',
      supplierId: '',
      status: 'ACTIVE',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        product
          ? {
              name: product.name,
              sku: product.sku,
              description: product.description ?? '',
              image: product.image ?? '',
              brand: product.brand ?? '',
              unit: product.unit,
              purchasePrice: product.purchasePrice,
              salePrice: product.salePrice,
              stock: product.stock,
              minStock: product.minStock,
              categoryId: product.categoryId,
              supplierId: product.supplierId ?? '',
              status: product.status,
            }
          : {
              name: '',
              sku: '',
              description: '',
              image: '',
              brand: '',
              unit: 'UND',
              purchasePrice: 0,
              salePrice: 0,
              stock: 0,
              minStock: 5,
              categoryId: categories[0]?.id ?? '',
              supplierId: '',
              status: 'ACTIVE',
            },
      );
    }
  }, [open, product, form, categories]);

  const handleGenerateSku = async () => {
    setGeneratingSku(true);
    try {
      const sku = await generateNextSku(form.getValues('categoryId'));
      form.setValue('sku', sku, { shouldValidate: true });
    } finally {
      setGeneratingSku(false);
    }
  };

  const onSubmit = (values: ProductInput) => {
    startTransition(async () => {
      const res = isEdit
        ? await updateProduct(product!.id, values)
        : await createProduct(values);
      if (res.ok) {
        toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  const salePrice = form.watch('salePrice');
  const purchasePrice = form.watch('purchasePrice');
  const margin =
    purchasePrice > 0 ? (((salePrice - purchasePrice) / purchasePrice) * 100).toFixed(1) : '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-thin sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al catálogo'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[200px,1fr]">
              {/* Imagen */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={(url) => field.onChange(url ?? '')}
                        folder="products"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Martillo Stanley 16oz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <div className="flex gap-1">
                          <FormControl>
                            <Input placeholder="HER-001" className="font-mono uppercase" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGenerateSku}
                            disabled={generatingSku || isPending}
                            title="Generar SKU automático"
                          >
                            {generatingSku ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Stanley, Bosch, Truper..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción técnica, características, especificaciones..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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
                          <SelectValue placeholder="Sin proveedor" />
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
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio compra *</FormLabel>
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
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio venta *</FormLabel>
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
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Margen: {margin}%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock actual</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" className="font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" className="font-mono" {...field} />
                    </FormControl>
                    <FormDescription>Para alertas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="DISCONTINUED">Descontinuado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isEdit ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
