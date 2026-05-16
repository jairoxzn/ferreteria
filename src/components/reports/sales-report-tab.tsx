'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  getSalesByDayReport,
  getSalesSummary,
  type SalesByDayReport,
  type SalesSummary,
} from '@/actions/reports';
import { DateRangePicker, type DateRangeValue } from './date-range-picker';
import { ExportButtons } from './export-buttons';

export function SalesReportTab() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [range, setRange] = React.useState<DateRangeValue>({
    from: monthStart.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  });
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<SalesByDayReport[]>([]);
  const [summary, setSummary] = React.useState<SalesSummary | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [d, s] = await Promise.all([
        getSalesByDayReport(range.from, range.to),
        getSalesSummary(range.from, range.to),
      ]);
      setData(d);
      setSummary(s);
    } catch {
      toast.error('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <DateRangePicker value={range} onChange={setRange} />
          <ExportButtons
            rows={data}
            columns={[
              { header: 'Fecha', accessor: (r) => r.date, width: 14 },
              { header: 'Ventas', accessor: (r) => r.count, width: 10 },
              { header: 'Total (S/)', accessor: (r) => r.total.toFixed(2), width: 14 },
              { header: 'Ticket promedio', accessor: (r) => r.avgTicket.toFixed(2), width: 16 },
            ]}
            filename="ventas-por-dia"
            title="Reporte de ventas por día"
            subtitle={`Periodo: ${range.from} → ${range.to}`}
          />
        </div>
      </Card>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Ingresos totales" value={formatCurrency(summary.totalRevenue)} primary />
          <SummaryCard label="Ventas" value={formatNumber(summary.totalSales)} />
          <SummaryCard label="Ticket promedio" value={formatCurrency(summary.avgTicket)} />
          <SummaryCard
            label="Ganancia estimada"
            value={formatCurrency(summary.totalProfit)}
            highlight={summary.totalProfit > 0 ? 'success' : 'destructive'}
          />
        </div>
      )}

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Tendencia diaria</p>
        </div>
        {loading ? (
          <div className="flex h-72 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Sin datos en el periodo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v: number) => `S/${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as SalesByDayReport;
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-medium">{p.date}</p>
                      <p className="mt-1 font-bold text-primary">{formatCurrency(p.total)}</p>
                      <p className="text-muted-foreground">{p.count} ventas</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#repGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  primary,
  highlight,
}: {
  label: string;
  value: string;
  primary?: boolean;
  highlight?: 'success' | 'destructive';
}) {
  return (
    <Card className="p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 truncate font-mono text-xl font-bold ${
          primary
            ? 'text-primary'
            : highlight === 'success'
              ? 'text-emerald-600'
              : highlight === 'destructive'
                ? 'text-rose-600'
                : ''
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
