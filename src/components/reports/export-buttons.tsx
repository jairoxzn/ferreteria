'use client';

import * as React from 'react';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportToExcel, exportToPDF, type ExportColumn } from '@/lib/export';

interface Props<T> {
  rows: T[];
  columns: ExportColumn<T>[];
  filename: string;
  title: string;
  subtitle?: string;
}

export function ExportButtons<T>({ rows, columns, filename, title, subtitle }: Props<T>) {
  const [busy, setBusy] = React.useState<'pdf' | 'xlsx' | null>(null);

  const handle = async (type: 'pdf' | 'xlsx') => {
    if (rows.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    setBusy(type);
    try {
      if (type === 'xlsx') {
        await exportToExcel(rows, columns, filename);
      } else {
        await exportToPDF(rows, columns, filename, title, subtitle);
      }
      toast.success(`Reporte ${type.toUpperCase()} generado`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al exportar');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handle('xlsx')}
        disabled={busy !== null}
      >
        {busy === 'xlsx' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handle('pdf')}
        disabled={busy !== null}
      >
        {busy === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        PDF
      </Button>
    </div>
  );
}
