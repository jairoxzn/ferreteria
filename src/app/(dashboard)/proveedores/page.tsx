import type { Metadata } from 'next';
import { Truck } from 'lucide-react';
import { getSuppliers } from '@/actions/suppliers';
import { SuppliersClient } from '@/components/suppliers/suppliers-client';

export const metadata: Metadata = { title: 'Proveedores' };
export const dynamic = 'force-dynamic';

export default async function ProveedoresPage() {
  const data = await getSuppliers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Proveedores</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Gestiona los proveedores y sus productos asociados
          </p>
        </div>
      </div>

      <SuppliersClient data={data} />
    </div>
  );
}
