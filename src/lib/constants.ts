export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Ferretería Pro';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const IGV = parseFloat(process.env.NEXT_PUBLIC_IGV || '0.18');

export const ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  ALMACEN: 'ALMACEN',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  ALMACEN: 'Almacén',
};

export const PAYMENT_METHODS = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
} as const;

export const UNITS = ['UND', 'KG', 'G', 'M', 'CM', 'L', 'ML', 'CIENTO', 'DOCENA', 'CAJA', 'PAR'];

export const PUBLIC_ROUTES = ['/login'];
export const AUTH_REDIRECT = '/dashboard';
export const LOGIN_ROUTE = '/login';
