import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Caja' };

export default function CajaPage() {
  return (
    <PagePlaceholder
      title="Caja Registradora"
      description="Apertura y cierre de caja, movimientos de efectivo y arqueo diario."
      features={[
        'Apertura de caja con monto inicial',
        'Cierre con cálculo automático de diferencia',
        'Movimientos de ingreso y egreso',
        'Reporte diario imprimible',
        'Historial completo por usuario',
      ]}
    />
  );
}
