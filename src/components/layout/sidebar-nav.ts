import {
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  ShoppingCart,
  Users,
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: ('ADMIN' | 'VENDEDOR' | 'ALMACEN')[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { title: 'Productos', href: '/productos', icon: Package },
      { title: 'Categorías', href: '/categorias', icon: Layers },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { title: 'Inventario', href: '/inventario', icon: Warehouse, roles: ['ADMIN', 'ALMACEN'] },
      { title: 'Ventas (POS)', href: '/ventas', icon: ShoppingCart, badge: 'POS' },
      { title: 'Caja', href: '/caja', icon: DollarSign, roles: ['ADMIN', 'VENDEDOR'] },
    ],
  },
  {
    label: 'Personas',
    items: [
      { title: 'Clientes', href: '/clientes', icon: Users },
      { title: 'Proveedores', href: '/proveedores', icon: Truck, roles: ['ADMIN', 'ALMACEN'] },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { title: 'Reportes', href: '/reportes', icon: BarChart3, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Administración',
    items: [
      { title: 'Usuarios', href: '/usuarios', icon: UserCog, roles: ['ADMIN'] },
      { title: 'Configuración', href: '/configuracion', icon: Settings, roles: ['ADMIN'] },
    ],
  },
];
