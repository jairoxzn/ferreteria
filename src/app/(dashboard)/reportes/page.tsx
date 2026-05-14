import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Reportes' };

export default function ReportesPage() {
  return (
    <PagePlaceholder
      title="Reportes"
      description="Reportes empresariales exportables a PDF y Excel, filtrables por fechas."
      features={[
        'Ventas por período (día, semana, mes)',
        'Productos más vendidos y rentables',
        'Stock crítico y productos agotados',
        'Ganancias y margen por categoría',
        'Exportación a PDF y Excel',
      ]}
    />
  );
}
