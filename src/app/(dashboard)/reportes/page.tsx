import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';
import { auth } from '@/auth';
import { requireRole } from '@/lib/auth-helpers';
import { getStockReport } from '@/actions/reports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesReportTab } from '@/components/reports/sales-report-tab';
import { TopProductsTab } from '@/components/reports/top-products-tab';
import { StockReportTab } from '@/components/reports/stock-report-tab';

export const metadata: Metadata = { title: 'Reportes' };
export const dynamic = 'force-dynamic';

export default async function ReportesPage() {
  requireRole(await auth(), ['ADMIN']);
  const stockData = await getStockReport();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Reportes</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Análisis empresarial con exportación a PDF y Excel
          </p>
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="h-auto w-full sm:w-auto sm:inline-flex">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="products">Top productos</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReportTab />
        </TabsContent>
        <TabsContent value="products">
          <TopProductsTab />
        </TabsContent>
        <TabsContent value="stock">
          <StockReportTab data={stockData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
