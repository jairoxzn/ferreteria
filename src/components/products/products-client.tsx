'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { ProductFormDialog } from './product-form-dialog';
import { createProductColumns } from './product-columns';
import type { ProductRow } from '@/actions/products';

interface Props {
  data: ProductRow[];
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function ProductsClient({ data, categories, suppliers }: Props) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const columns = React.useMemo(
    () => createProductColumns({ categories, suppliers }),
    [categories, suppliers],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="name"
            searchPlaceholder="Buscar por nombre..."
          >
            <Button onClick={() => setCreateOpen(true)} disabled={categories.length === 0}>
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </DataTableToolbar>
        )}
        emptyTitle="Sin productos"
        emptyDescription={
          categories.length === 0
            ? 'Primero crea una categoría'
            : 'Empieza agregando tu primer producto'
        }
      />

      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        suppliers={suppliers}
      />
    </>
  );
}
