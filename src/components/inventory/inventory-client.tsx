'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { MovementFormDialog } from './movement-form-dialog';
import { movementColumns } from './movement-columns';
import type { MovementRow } from '@/actions/inventory';

interface Props {
  data: MovementRow[];
  products: { id: string; name: string; sku: string; stock: number }[];
  suppliers: { id: string; name: string }[];
}

export function InventoryClient({ data, products, suppliers }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <DataTable
        columns={movementColumns}
        data={data}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumn="productName"
            searchPlaceholder="Buscar movimiento..."
          >
            <Button onClick={() => setOpen(true)} disabled={products.length === 0}>
              <Plus className="h-4 w-4" />
              Nuevo movimiento
            </Button>
          </DataTableToolbar>
        )}
        emptyTitle="Sin movimientos"
        emptyDescription="Registra entradas y salidas de stock"
      />
      <MovementFormDialog
        open={open}
        onOpenChange={setOpen}
        products={products}
        suppliers={suppliers}
      />
    </>
  );
}
