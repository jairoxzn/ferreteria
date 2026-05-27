import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

type AppRole = 'ADMIN' | 'VENDEDOR' | 'ALMACEN';

export function requireAuth(session: Session | null): Session {
  if (!session?.user) redirect('/login');
  return session;
}

export function requireRole(session: Session | null, roles: AppRole[]): Session {
  const s = requireAuth(session);
  if (!roles.includes(s.user.role)) redirect('/dashboard');
  return s;
}
