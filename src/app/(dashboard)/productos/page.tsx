import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Productos' };

export default function ProductosPage() {
  return (
    <PagePlaceholder
      title="Productos"
      description="Gestiona el catálogo completo de productos con SKU, QR, precios e imágenes."
      features={[
        'CRUD completo con validación Zod',
        'Subida de imágenes local / Vercel Blob',
        'Generación automática de SKU y QR',
        'Filtros avanzados por categoría, marca, estado',
        'Importación/exportación CSV',
      ]}
    />
  );
}
