'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { CategoryFormDialog } from './category-form-dialog';
import { categoryColumns } from './category-columns';
import type { CategoryRow } from '@/actions/categories';

interface Props {
  data: CategoryRow[];
}

export function CategoriesClient({ data }: Props) {
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <>
      <DataTable
        columns={categoryColumns}
        data={data}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="name"
            searchPlaceholder="Buscar categoría..."
          >
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nueva categoría
            </Button>
          </DataTableToolbar>
        )}
        emptyTitle="Sin categorías"
        emptyDescription="Crea tu primera categoría para empezar"
      />

      <CategoryFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
