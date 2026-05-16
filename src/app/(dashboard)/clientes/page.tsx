import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { getCustomers } from '@/actions/customers';
import { CustomersClient } from '@/components/customers/customers-client';

export const metadata: Metadata = { title: 'Clientes' };
export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const data = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Clientes</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Registro de clientes e historial de compras
          </p>
        </div>
      </div>

      <CustomersClient data={data} />
    </div>
  );
}
