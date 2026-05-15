'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { SupplierFormDialog } from './supplier-form-dialog';
import { supplierColumns } from './supplier-columns';
import type { SupplierRow } from '@/actions/suppliers';

export function SuppliersClient({ data }: { data: SupplierRow[] }) {
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <>
      <DataTable
        columns={supplierColumns}
        data={data}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="company"
            searchPlaceholder="Buscar empresa..."
          >
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo proveedor
            </Button>
          </DataTableToolbar>
        )}
        emptyTitle="Sin proveedores"
        emptyDescription="Registra tu primer proveedor"
      />
      <SupplierFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
