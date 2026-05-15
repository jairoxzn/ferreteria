import type { Metadata } from 'next';
import { Package } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getProducts } from '@/actions/products';
import { requireAuth } from '@/lib/auth-helpers';
import { ProductsClient } from '@/components/products/products-client';

export const metadata: Metadata = { title: 'Productos' };
export const dynamic = 'force-dynamic';

export default async function ProductosPage() {
  await requireAuth();

  const [data, categories, suppliers] = await Promise.all([
    getProducts(),
    prisma.category.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      where: { active: true },
      select: { id: true, company: true },
      orderBy: { company: 'asc' },
    }),
  ]);

  const supplierOptions = suppliers.map((s) => ({ id: s.id, name: s.company }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Productos</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Catálogo completo de productos
          </p>
        </div>
      </div>

      <ProductsClient data={data} categories={categories} suppliers={supplierOptions} />
    </div>
  );
}
