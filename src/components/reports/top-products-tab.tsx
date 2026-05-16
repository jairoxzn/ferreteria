'use client';

import * as React from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
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
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getTopProductsReport, type TopProductReport } from '@/actions/reports';
import { DateRangePicker, type DateRangeValue } from './date-range-picker';
import { ExportButtons } from './export-buttons';

export function TopProductsTab() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [range, setRange] = React.useState<DateRangeValue>({
    from: monthStart.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  });
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<TopProductReport[]>([]);

  React.useEffect(() => {
    setLoading(true);
    getTopProductsReport(range.from, range.to, 50)
      .then(setData)
      .catch(() => toast.error('Error al cargar'))
      .finally(() => setLoading(false));
  }, [range]);

  const maxSold = data[0]?.unitsSold ?? 1;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <DateRangePicker value={range} onChange={setRange} />
          <ExportButtons
            rows={data}
            columns={[
              { header: '#', accessor: (_r) => data.indexOf(_r) + 1, width: 5 },
              { header: 'SKU', accessor: (r) => r.sku, width: 14 },
              { header: 'Producto', accessor: (r) => r.name, width: 36 },
              { header: 'Categoría', accessor: (r) => r.category, width: 18 },
              { header: 'Unidades', accessor: (r) => r.unitsSold, width: 12 },
              { header: 'Ingresos', accessor: (r) => r.revenue.toFixed(2), width: 14 },
              { header: 'Ganancia', accessor: (r) => r.profit.toFixed(2), width: 14 },
            ]}
            filename="top-productos"
            title="Productos más vendidos"
            subtitle={`Periodo: ${range.from} → ${range.to}`}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 border-b p-4">
          <Trophy className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Productos más vendidos</p>
        </div>
        {loading ? (
          <div className="flex h-72 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Sin ventas en el periodo
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Vendido</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Ganancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p, i) => (
                <TableRow key={p.productId}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold">{i + 1}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(p.unitsSold / maxSold) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm font-semibold">
                        {formatNumber(p.unitsSold)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(p.revenue)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm font-semibold ${
                      p.profit > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(p.profit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
