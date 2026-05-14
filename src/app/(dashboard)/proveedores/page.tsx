import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Proveedores' };

export default function ProveedoresPage() {
  return (
    <PagePlaceholder
      title="Proveedores"
      description="Gestiona proveedores, productos asociados e historial de compras."
      features={[
        'CRUD con RUC único validado',
        'Productos asociados por proveedor',
        'Historial de compras y entregas',
        'Datos de contacto y ciudad',
      ]}
    />
  );
}
