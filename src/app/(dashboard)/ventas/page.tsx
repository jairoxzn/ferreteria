import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { getCurrentCashRegister } from '@/actions/cash';
import { POSClient } from '@/components/pos/pos-client';
import { NoCashWarning } from '@/components/pos/no-cash-warning';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Ventas POS' };
export const dynamic = 'force-dynamic';

export default async function VentasPage() {
  requireRole(await auth(), ['ADMIN', 'VENDEDOR']);
  const cash = await getCurrentCashRegister();

  if (!cash) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Punto de venta
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Registra ventas rápidamente con carrito y múltiples pagos
            </p>
          </div>
        </div>
        <NoCashWarning />
      </div>
    );
  }

  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.customer.findMany({
      where: { active: true },
      select: { id: true, name: true, document: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const posProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    salePrice: p.salePrice.toNumber(),
    stock: p.stock,
    image: p.image,
    categoryName: p.category.name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Punto de venta
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {products.length} producto{products.length === 1 ? '' : 's'} activos
            </p>
          </div>
        </div>
        <Badge variant="success" className="font-mono">
          Caja {cash.code}
        </Badge>
      </div>

      <POSClient products={posProducts} customers={customers} />
    </div>
  );
}
