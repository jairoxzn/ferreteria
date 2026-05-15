import type { Metadata } from 'next';
import { Layers } from 'lucide-react';
import { getCategories } from '@/actions/categories';
import { CategoriesClient } from '@/components/categories/categories-client';

export const metadata: Metadata = { title: 'Categorías' };
export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const data = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Categorías</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Organiza tus productos por categorías
          </p>
        </div>
      </div>

      <CategoriesClient data={data} />
    </div>
  );
}
