'use client';

import * as React from 'react';
import { Minus, Plus, ShoppingCart, Trash2, User, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { selectTotals, useCartStore } from '@/stores/cart-store';
import { IGV } from '@/lib/constants';
import { CustomerFormDialog } from '@/components/customers/customer-form-dialog';

interface Props {
  customers: { id: string; name: string; document: string | null }[];
  onCheckout: () => void;
}

export function CartPanel({ customers, onCheckout }: Props) {
  const items = useCartStore((s) => s.items);
  const customerId = useCartStore((s) => s.customerId);
  const customerName = useCartStore((s) => s.customerName);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const setCustomer = useCartStore((s) => s.setCustomer);
  const setDiscountAmount = useCartStore((s) => s.setDiscountAmount);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const setLineDiscount = useCartStore((s) => s.setLineDiscount);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const totals = useCartStore(selectTotals);

  const [newCustomerOpen, setNewCustomerOpen] = React.useState(false);

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b p-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Carrito</p>
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary">
            {items.length}
          </span>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="h-3 w-3" />
            Vaciar
          </Button>
        )}
      </div>

      {/* Customer */}
      <div className="border-b p-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value={customerId ?? '__none'}
              onValueChange={(v) => {
                if (v === '__none') setCustomer(null, null);
                else {
                  const c = customers.find((x) => x.id === v);
                  setCustomer(c?.id ?? null, c?.name ?? null);
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue>
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">{customerName ?? 'Cliente genérico'}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— Cliente genérico —</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.document ? `(${c.document})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setNewCustomerOpen(true)}
            title="Nuevo cliente"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items */}
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <ShoppingCart className="mb-2 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">Carrito vacío</p>
            <p className="text-xs text-muted-foreground">
              Agrega productos desde el panel izquierdo
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.productId} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {item.sku} · {formatCurrency(item.unitPrice)}/{item.unit}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="h-7 w-12 px-1 text-center font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm font-semibold">
                    {formatCurrency(item.quantity * item.unitPrice - item.discount)}
                  </p>
                </div>
                {item.discount > 0 && (
                  <div className="mt-1 flex items-center justify-between text-[10px] text-amber-600">
                    <span>Descuento:</span>
                    <span className="font-mono">−{formatCurrency(item.discount)}</span>
                  </div>
                )}
                <div className="mt-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Descuento por línea"
                    value={item.discount || ''}
                    onChange={(e) =>
                      setLineDiscount(item.productId, parseFloat(e.target.value) || 0)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 border-t bg-muted/20 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-mono font-medium">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Descuento global:</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={discountAmount || ''}
            onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
            className="h-7 flex-1 text-right font-mono text-xs"
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">IGV ({(IGV * 100).toFixed(0)}%):</span>
          <span className="font-mono">{formatCurrency(totals.tax)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="font-bold">Total:</span>
          <span className="font-mono text-2xl font-bold text-primary">
            {formatCurrency(totals.total)}
          </span>
        </div>
        <Button
          className="mt-1 h-11 w-full text-base"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Cobrar {formatCurrency(totals.total)}
        </Button>
      </div>

      <CustomerFormDialog
        open={newCustomerOpen}
        onOpenChange={setNewCustomerOpen}
        onCreated={(c) => setCustomer(c.id, c.name)}
      />
    </Card>
  );
}
