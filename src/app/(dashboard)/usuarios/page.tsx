import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Usuarios' };

export default function UsuariosPage() {
  return (
    <PagePlaceholder
      title="Usuarios del sistema"
      description="Gestión de usuarios, roles y permisos del sistema."
      features={[
        'CRUD de usuarios con roles',
        'Asignación: Admin / Vendedor / Almacén',
        'Activar/desactivar cuentas',
        'Reseteo de contraseñas',
        'Auditoría de accesos',
      ]}
    />
  );
}
