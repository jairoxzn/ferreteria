'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { UserFormDialog } from './user-form-dialog';
import { createUserColumns } from './user-columns';
import type { UserRow } from '@/actions/users';

export function UsersClient({ data, currentUserId }: { data: UserRow[]; currentUserId: string }) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const columns = React.useMemo(() => createUserColumns(currentUserId), [currentUserId]);

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
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo usuario
            </Button>
          </DataTableToolbar>
        )}
        emptyTitle="Sin usuarios"
        emptyDescription="Crea tu primer usuario del sistema"
      />
      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
