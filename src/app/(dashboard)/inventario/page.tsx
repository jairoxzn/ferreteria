import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Inventario' };

export default function InventarioPage() {
  return (
    <PagePlaceholder
      title="Inventario"
      description="Control total de entradas, salidas, kardex y alertas de stock mínimo."
      features={[
        'Entradas y salidas con stock automático',
        'Kardex valorizado por producto',
        'Ajustes manuales auditados',
        'Alertas de stock mínimo en tiempo real',
        'Historial completo de movimientos',
      ]}
    />
  );
}
