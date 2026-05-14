import { redirect } from 'next/navigation';
import { auth } from '@/auth';

type AppRole = 'ADMIN' | 'VENDEDOR' | 'ALMACEN';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return session;
}

export async function requireRole(roles: AppRole[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) redirect('/dashboard');
  return session;
}
