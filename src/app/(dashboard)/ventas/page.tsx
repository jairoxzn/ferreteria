import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Ventas - POS' };

export default function VentasPage() {
  return (
    <PagePlaceholder
      title="Ventas (POS)"
      description="Punto de venta rápido, escáner QR, múltiples métodos de pago e impresión de tickets."
      features={[
        'Carrito dinámico con búsqueda instantánea',
        'Escáner QR con cámara web',
        'Descuentos por línea y totales',
        'IGV configurable',
        'Pagos múltiples: Efectivo, Tarjeta, Yape, Plin',
        'Generación de tickets/boletas en PDF',
      ]}
    />
  );
}
