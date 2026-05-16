'use client';

import * as React from 'react';
import { Loader2, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { type StockReportRow } from '@/actions/reports';
import { ExportButtons } from './export-buttons';

export function StockReportTab({ data }: { data: StockReportRow[] }) {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }, [data, query]);

  const totalValue = filtered.reduce((acc, r) => acc + r.totalValue, 0);
  const totalUnits = filtered.reduce((acc, r) => acc + r.stock, 0);
  const lowCount = filtered.filter((r) => r.status === 'LOW').length;
  const outCount = filtered.filter((r) => r.status === 'OUT').length;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Input
            placeholder="Buscar producto, SKU o categoría..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          <ExportButtons
            rows={filtered}
            columns={[
              { header: 'SKU', accessor: (r) => r.sku, width: 12 },
              { header: 'Producto', accessor: (r) => r.name, width: 36 },
              { header: 'Categoría', accessor: (r) => r.category, width: 16 },
              { header: 'Stock', accessor: (r) => r.stock, width: 8 },
              { header: 'Mínimo', accessor: (r) => r.minStock, width: 8 },
              { header: 'Unidad', accessor: (r) => r.unit, width: 8 },
              { header: 'P. compra', accessor: (r) => r.purchasePrice.toFixed(2), width: 12 },
              { header: 'P. venta', accessor: (r) => r.salePrice.toFixed(2), width: 12 },
              { header: 'Valor total', accessor: (r) => r.totalValue.toFixed(2), width: 14 },
              {
                header: 'Estado',
                accessor: (r) =>
                  r.status === 'OUT' ? 'Agotado' : r.status === 'LOW' ? 'Crítico' : 'OK',
                width: 10,
              },
            ]}
            filename="stock-actual"
            title="Reporte de stock"
            subtitle={`${data.length} productos · Valor S/${totalValue.toFixed(2)}`}
          />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Productos" value={formatNumber(filtered.length)} />
        <Mini label="Unidades" value={formatNumber(totalUnits)} />
        <Mini label="Críticos" value={lowCount.toString()} highlight="warning" />
        <Mini
          label="Valor total"
          value={formatCurrency(totalValue)}
          highlight="success"
        />
      </div>

      <Card>
        <div className="flex items-center gap-2 border-b p-4">
          <Package className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Stock actual</p>
          {outCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {outCount} agotado{outCount === 1 ? '' : 's'}
            </Badge>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">P. venta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium">{r.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{r.sku}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {r.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {r.stock} <span className="text-[10px] text-muted-foreground">{r.unit}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(r.salePrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium">
                    {formatCurrency(r.totalValue)}
                  </TableCell>
                  <TableCell>
                    {r.status === 'OUT' ? (
                      <Badge variant="destructive">Agotado</Badge>
                    ) : r.status === 'LOW' ? (
                      <Badge variant="warning">Crítico</Badge>
                    ) : (
                      <Badge variant="success">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Mini({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'success' | 'warning';
}) {
  return (
    <Card className="p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-xl font-bold ${
          highlight === 'success'
            ? 'text-emerald-600'
            : highlight === 'warning'
              ? 'text-amber-600'
              : ''
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
