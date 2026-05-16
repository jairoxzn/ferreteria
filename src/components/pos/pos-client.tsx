'use client';

import * as React from 'react';
import { selectTotals, useCartStore } from '@/stores/cart-store';
import { ProductSearchPanel, type POSProduct } from './product-search-panel';
import { CartPanel } from './cart-panel';
import { PaymentDialog } from './payment-dialog';
import { TicketDialog } from './ticket-dialog';

interface Props {
  products: POSProduct[];
  customers: { id: string; name: string; document: string | null }[];
}

export function POSClient({ products, customers }: Props) {
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [ticketId, setTicketId] = React.useState<string | null>(null);
  const items = useCartStore((s) => s.items);
  const totals = useCartStore(selectTotals);

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (totals.total <= 0) return;
    setPaymentOpen(true);
  };

  return (
    <>
      <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-[1fr,380px]">
        <div className="overflow-hidden rounded-xl border bg-card">
          <ProductSearchPanel products={products} />
        </div>
        <div className="overflow-hidden">
          <CartPanel customers={customers} onCheckout={handleCheckout} />
        </div>
      </div>

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={(id) => setTicketId(id)}
      />

      <TicketDialog saleId={ticketId} onClose={() => setTicketId(null)} />
    </>
  );
}
