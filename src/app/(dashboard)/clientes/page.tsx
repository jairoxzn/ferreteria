import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Clientes' };

export default function ClientesPage() {
  return (
    <PagePlaceholder
      title="Clientes"
      description="Registro de clientes, historial de compras y detección de clientes frecuentes."
      features={[
        'Registro con DNI/RUC validado',
        'Historial completo de compras',
        'Ranking de clientes frecuentes',
        'Ticket promedio por cliente',
      ]}
    />
  );
}
