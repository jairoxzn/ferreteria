'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/validations/user';
import { createUser, updateUser, type UserRow } from '@/actions/users';
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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserRow | null;
}

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const [showPwd, setShowPwd] = React.useState(false);
  const isEdit = !!user;

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'VENDEDOR',
      password: '',
      phone: '',
      active: true,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
              password: '',
              phone: user.phone ?? '',
              active: user.active,
            }
          : {
              name: '',
              email: '',
              role: 'VENDEDOR',
              password: '',
              phone: '',
              active: true,
            },
      );
    }
  }, [open, user, form]);

  const onSubmit = (values: CreateUserInput) => {
    startTransition(async () => {
      if (isEdit) {
        const updateData: UpdateUserInput = { ...values };
        if (!values.password) delete updateData.password;
        const res = await updateUser(user!.id, updateData);
        if (res.ok) {
          toast.success('Usuario actualizado');
          onOpenChange(false);
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await createUser(values);
        if (res.ok) {
          toast.success('Usuario creado');
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
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del usuario. Deja la contraseña vacía para no cambiarla.'
              : 'Crea un nuevo usuario del sistema con su rol asignado'}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@ferreteria.com" {...field} />
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <span className="font-medium">Administrador</span> · acceso total
                      </SelectItem>
                      <SelectItem value="VENDEDOR">
                        <span className="font-medium">Vendedor</span> · ventas, caja, clientes
                      </SelectItem>
                      <SelectItem value="ALMACEN">
                        <span className="font-medium">Almacén</span> · inventario, productos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'Nueva contraseña' : 'Contraseña *'}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPwd ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={isEdit ? 'Dejar vacío para no cambiar' : '••••••••'}
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>Mínimo 6 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Usuario activo</FormLabel>
                    <FormDescription>Puede iniciar sesión en el sistema</FormDescription>
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
                {isEdit ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
