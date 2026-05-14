import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Categorías' };

export default function CategoriasPage() {
  return (
    <PagePlaceholder
      title="Categorías"
      description="Organiza tus productos por categorías con iconos y colores personalizados."
      features={[
        'CRUD de categorías con slug único',
        'Selector de icono Lucide y color',
        'Conteo automático de productos asociados',
        'Reordenamiento con drag & drop',
      ]}
    />
  );
}
