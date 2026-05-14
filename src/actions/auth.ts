'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { loginSchema } from '@/lib/validations/auth';

export type LoginState = {
  ok: boolean;
  error?: string;
} | null;

// AUTH-EXEMPT: este action ES el flujo de login. Requerir sesión aquí haría
// imposible iniciar sesión. La validación de credenciales ocurre dentro de
// `signIn('credentials')` → `authorize()` en src/auth.ts.
export async function loginAction(formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  try {
    await signIn('credentials', {
      ...parsed.data,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { ok: false, error: 'Credenciales inválidas' };
        default:
          return { ok: false, error: 'No se pudo iniciar sesión' };
      }
    }
    throw error;
  }
}
