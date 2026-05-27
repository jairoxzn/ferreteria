'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { customerSchema, type CustomerInput } from '@/lib/validations/customer';
import type { ActionResult } from './categories';

export interface CustomerRow {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  salesCount: number;
  totalSpent: number;
  createdAt: Date;
}

export async function getCustomers(): Promise<CustomerRow[]> {
  requireAuth(await auth());
  const rows = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { sales: true } },
      sales: { select: { total: true }, where: { status: 'COMPLETED' } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    document: r.document,
    email: r.email,
    phone: r.phone,
    address: r.address,
    notes: r.notes,
    active: r.active,
    salesCount: r._count.sales,
    totalSpent: r.sales.reduce((acc, s) => acc + s.total.toNumber(), 0),
    createdAt: r.createdAt,
  }));
}

export async function getActiveCustomers() {
  requireAuth(await auth());
  return prisma.customer.findMany({
    where: { active: true },
    select: { id: true, name: true, document: true },
    orderBy: { name: 'asc' },
  });
}

export async function createCustomer(
  input: CustomerInput,
): Promise<ActionResult<{ id: string; name: string }>> {
  requireRole(await auth(), ['ADMIN', 'VENDEDOR']);
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const created = await prisma.customer.create({
      data: {
        name: parsed.data.name.trim(),
        document: parsed.data.document?.trim() || null,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        address: parsed.data.address?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    revalidatePath('/clientes');
    revalidatePath('/ventas');
    return { ok: true, data: { id: created.id, name: created.name } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un cliente con ese documento' };
    }
    return { ok: false, error: 'Error al crear el cliente' };
  }
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN', 'VENDEDOR']);
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        document: parsed.data.document?.trim() || null,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        address: parsed.data.address?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    revalidatePath('/clientes');
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un cliente con ese documento' };
    }
    return { ok: false, error: 'Error al actualizar el cliente' };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN']);
  try {
    const sales = await prisma.sale.count({ where: { customerId: id } });
    if (sales > 0) {
      return {
        ok: false,
        error: `No se puede eliminar: ${sales} venta${sales > 1 ? 's' : ''} asociada${sales > 1 ? 's' : ''}.`,
      };
    }
    await prisma.customer.delete({ where: { id } });
    revalidatePath('/clientes');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al eliminar el cliente' };
  }
}
