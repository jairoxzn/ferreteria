import type { Metadata } from 'next';
import { UserCog } from 'lucide-react';
import { requireRole } from '@/lib/auth-helpers';
import { getUsers } from '@/actions/users';
import { UsersClient } from '@/components/users/users-client';

export const metadata: Metadata = { title: 'Usuarios' };
export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const session = await requireRole(['ADMIN']);
  const data = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Usuarios</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Gestiona usuarios y roles del sistema
          </p>
        </div>
      </div>

      <UsersClient data={data} currentUserId={session.user.id} />
    </div>
  );
}
