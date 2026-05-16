'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [showPwd, setShowPwd] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Resuelve un destino seguro: solo paths internos (mismo origen).
  const resolveRedirect = (): string => {
    if (!callbackUrl) return '/dashboard';
    try {
      if (callbackUrl.startsWith('/')) return callbackUrl;
      const url = new URL(callbackUrl);
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return url.pathname + url.search + url.hash;
      }
    } catch {
      // url inválida
    }
    return '/dashboard';
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginInput) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('email', values.email);
      fd.set('password', values.password);
      const res = await loginAction(fd);

      if (res?.ok) {
        const target = resolveRedirect();
        toast.success('Sesión iniciada', { description: 'Redirigiendo...' });
        router.replace(target);
        router.refresh();
      } else {
        toast.error('Error al iniciar sesión', { description: res?.error });
      }
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@ferreteria.com"
            className="h-11 pl-10"
            disabled={isPending}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 pl-10 pr-10"
            disabled={isPending}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="h-11 w-full text-base" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Ingresando...
          </>
        ) : (
          'Ingresar al sistema'
        )}
      </Button>
    </motion.form>
  );
}
