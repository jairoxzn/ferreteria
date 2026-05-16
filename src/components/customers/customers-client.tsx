'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { CustomerFormDialog } from './customer-form-dialog';
import { customerColumns } from './customer-columns';
import type { CustomerRow } from '@/actions/customers';

export function CustomersClient({ data }: { data: CustomerRow[] }) {
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <>
      <DataTable
        columns={customerColumns}
        data={data}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="name"
            searchPlaceholder="Buscar cliente..."
          >
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          </DataTableToolbar>
        )}
        emptyTitle="Sin clientes"
        emptyDescription="Registra tu primer cliente"
      />
      <CustomerFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
