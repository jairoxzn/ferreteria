'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { supplierSchema, type SupplierInput } from '@/lib/validations/supplier';
import type { ActionResult } from './categories';

export interface SupplierRow {
  id: string;
  company: string;
  ruc: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  active: boolean;
  productCount: number;
  createdAt: Date;
}

export async function getSuppliers(): Promise<SupplierRow[]> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const rows = await prisma.supplier.findMany({
    orderBy: { company: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    company: r.company,
    ruc: r.ruc,
    contact: r.contact,
    email: r.email,
    phone: r.phone,
    address: r.address,
    city: r.city,
    notes: r.notes,
    active: r.active,
    productCount: r._count.products,
    createdAt: r.createdAt,
  }));
}

export async function getActiveSuppliersList() {
  requireRole(await auth(), ['ADMIN', 'VENDEDOR', 'ALMACEN']);
  return prisma.supplier.findMany({
    where: { active: true },
    select: { id: true, company: true, ruc: true },
    orderBy: { company: 'asc' },
  });
}

export async function createSupplier(input: SupplierInput): Promise<ActionResult<{ id: string }>> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const created = await prisma.supplier.create({
      data: {
        company: parsed.data.company.trim(),
        ruc: parsed.data.ruc,
        contact: parsed.data.contact?.trim() || null,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        address: parsed.data.address?.trim() || null,
        city: parsed.data.city?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        active: parsed.data.active,
      },
    });
    revalidatePath('/proveedores');
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un proveedor con ese RUC' };
    }
    return { ok: false, error: 'Error al crear el proveedor' };
  }
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        company: parsed.data.company.trim(),
        ruc: parsed.data.ruc,
        contact: parsed.data.contact?.trim() || null,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        address: parsed.data.address?.trim() || null,
        city: parsed.data.city?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        active: parsed.data.active,
      },
    });
    revalidatePath('/proveedores');
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un proveedor con ese RUC' };
    }
    return { ok: false, error: 'Error al actualizar el proveedor' };
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN']);
  try {
    const used = await prisma.product.count({ where: { supplierId: id } });
    if (used > 0) {
      return {
        ok: false,
        error: `No se puede eliminar: ${used} producto${used > 1 ? 's' : ''} asociado${used > 1 ? 's' : ''}. Desasocia los productos primero.`,
      };
    }
    await prisma.supplier.delete({ where: { id } });
    revalidatePath('/proveedores');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al eliminar el proveedor' };
  }
}

export async function toggleSupplierActive(id: string): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN', 'ALMACEN']);
  try {
    const s = await prisma.supplier.findUnique({ where: { id }, select: { active: true } });
    if (!s) return { ok: false, error: 'Proveedor no encontrado' };
    await prisma.supplier.update({ where: { id }, data: { active: !s.active } });
    revalidatePath('/proveedores');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al cambiar el estado' };
  }
}
