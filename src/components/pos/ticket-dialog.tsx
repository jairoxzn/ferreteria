'use client';

import * as React from 'react';
import { Printer, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { APP_NAME, PAYMENT_METHODS } from '@/lib/constants';
import { getSaleTicket, type SaleTicket } from '@/actions/sales';

interface Props {
  saleId: string | null;
  onClose: () => void;
}

export function TicketDialog({ saleId, onClose }: Props) {
  const [ticket, setTicket] = React.useState<SaleTicket | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!saleId) {
      setTicket(null);
      return;
    }
    setLoading(true);
    getSaleTicket(saleId)
      .then(setTicket)
      .finally(() => setLoading(false));
  }, [saleId]);

  const handlePrint = () => window.print();

  return (
    <Dialog open={!!saleId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-md print:max-w-full print:shadow-none">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-3 print:hidden">
          <p className="text-sm font-semibold">Comprobante de venta</p>
          <div className="flex gap-1">
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Cargando comprobante...
          </div>
        )}

        {ticket && (
          <div id="ticket-print" className="p-6 font-mono text-xs">
            <div className="space-y-1 text-center">
              <p className="text-base font-bold tracking-wide">{APP_NAME}</p>
              <p className="text-[10px]">Sistema de inventario y ventas</p>
              <p className="text-[10px] text-muted-foreground">
                {formatDateTime(ticket.createdAt)}
              </p>
              <p className="font-bold">{ticket.code}</p>
            </div>

            <hr className="my-3 border-dashed" />

            <div className="space-y-0.5 text-[11px]">
              <p>
                <strong>Cliente:</strong> {ticket.customerName ?? 'Cliente genérico'}
              </p>
              {ticket.customerDocument && (
                <p>
                  <strong>Doc:</strong> {ticket.customerDocument}
                </p>
              )}
              <p>
                <strong>Atendió:</strong> {ticket.userName}
              </p>
            </div>

            <hr className="my-3 border-dashed" />

            <div className="space-y-2">
              {ticket.details.map((d, i) => (
                <div key={i}>
                  <p className="font-medium">{d.productName}</p>
                  <div className="flex justify-between text-[11px]">
                    <span>
                      {d.quantity} x {formatCurrency(d.unitPrice)}
                    </span>
                    <span>{formatCurrency(d.subtotal)}</span>
                  </div>
                  {d.discount > 0 && (
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Descuento</span>
                      <span>−{formatCurrency(d.discount)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <hr className="my-3 border-dashed" />

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(ticket.subtotal)}</span>
              </div>
              {ticket.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Descuento</span>
                  <span>−{formatCurrency(ticket.discountAmount)}</span>
                </div>
              )}
              {ticket.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>IGV</span>
                  <span>{formatCurrency(ticket.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(ticket.total)}</span>
              </div>
            </div>

            <hr className="my-3 border-dashed" />

            <div className="space-y-1 text-[11px]">
              <p className="font-semibold">Métodos de pago:</p>
              {ticket.payments.map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {PAYMENT_METHODS[p.method]}
                    {p.reference && ` (${p.reference})`}
                  </span>
                  <span>{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>

            {ticket.notes && (
              <>
                <hr className="my-3 border-dashed" />
                <p className="text-[10px] italic">{ticket.notes}</p>
              </>
            )}

            <hr className="my-3 border-dashed" />
            <p className="text-center text-[10px] text-muted-foreground">
              ¡Gracias por su compra!
            </p>
            <p className="text-center text-[10px] text-muted-foreground">
              Este documento no tiene validez tributaria
            </p>
          </div>
        )}
      </DialogContent>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket-print,
          #ticket-print * {
            visibility: visible;
          }
          #ticket-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 4mm;
          }
        }
      `}</style>
    </Dialog>
  );
}
