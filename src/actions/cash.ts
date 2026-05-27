'use server';

import { revalidatePath } from 'next/cache';
import {
  CashMovementType,
  CashRegisterStatus,
  PaymentMethod,
  Prisma,
} from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { generateCashCode } from '@/lib/utils';
import {
  openCashSchema,
  closeCashSchema,
  cashMovementSchema,
  type OpenCashInput,
  type CloseCashInput,
  type CashMovementInput,
} from '@/lib/validations/cash';
import type { ActionResult } from './categories';

export interface CurrentCashRegister {
  id: string;
  code: string;
  openingAmount: number;
  notes: string | null;
  openedAt: Date;
  userName: string;
  // Calculados
  totalSalesCash: number;
  totalIncome: number;
  totalExpense: number;
  expectedAmount: number;
  movements: Array<{
    id: string;
    type: CashMovementType;
    amount: number;
    reason: string;
    notes: string | null;
    createdAt: Date;
  }>;
  salesCount: number;
}

export async function getCurrentCashRegister(): Promise<CurrentCashRegister | null> {
  const session = requireAuth(await auth());
  const cash = await prisma.cashRegister.findFirst({
    where: { userId: session.user.id, status: CashRegisterStatus.OPEN },
    include: {
      user: { select: { name: true } },
      movements: { orderBy: { createdAt: 'desc' } },
      sales: {
        include: { payments: { where: { method: PaymentMethod.EFECTIVO } } },
      },
    },
  });

  if (!cash) return null;

  const totalSalesCash = cash.sales.reduce(
    (acc, s) => acc + s.payments.reduce((a, p) => a + p.amount.toNumber(), 0),
    0,
  );
  const totalIncome = cash.movements
    .filter((m) => m.type === CashMovementType.INCOME)
    .reduce((acc, m) => acc + m.amount.toNumber(), 0);
  const totalExpense = cash.movements
    .filter((m) => m.type === CashMovementType.EXPENSE)
    .reduce((acc, m) => acc + m.amount.toNumber(), 0);

  const expectedAmount =
    cash.openingAmount.toNumber() + totalSalesCash + totalIncome - totalExpense;

  return {
    id: cash.id,
    code: cash.code,
    openingAmount: cash.openingAmount.toNumber(),
    notes: cash.notes,
    openedAt: cash.openedAt,
    userName: cash.user.name,
    totalSalesCash,
    totalIncome,
    totalExpense,
    expectedAmount,
    salesCount: cash.sales.length,
    movements: cash.movements.map((m) => ({
      id: m.id,
      type: m.type,
      amount: m.amount.toNumber(),
      reason: m.reason,
      notes: m.notes,
      createdAt: m.createdAt,
    })),
  };
}

export async function openCashRegister(
  input: OpenCashInput,
): Promise<ActionResult<{ id: string }>> {
  const session = requireRole(await auth(), ['ADMIN', 'VENDEDOR']);
  const parsed = openCashSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const existing = await prisma.cashRegister.findFirst({
      where: { userId: session.user.id, status: CashRegisterStatus.OPEN },
    });
    if (existing) return { ok: false, error: 'Ya tienes una caja abierta' };

    const count = await prisma.cashRegister.count();
    const code = generateCashCode(count + 1);

    const created = await prisma.cashRegister.create({
      data: {
        code,
        openingAmount: new Prisma.Decimal(parsed.data.openingAmount),
        notes: parsed.data.notes?.trim() || null,
        userId: session.user.id,
        status: CashRegisterStatus.OPEN,
      },
    });

    revalidatePath('/caja');
    return { ok: true, data: { id: created.id } };
  } catch {
    return { ok: false, error: 'Error al abrir la caja' };
  }
}

export async function closeCashRegister(input: CloseCashInput): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN', 'VENDEDOR']);
  const parsed = closeCashSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const current = await getCurrentCashRegister();
    if (!current) return { ok: false, error: 'No hay caja abierta' };

    const difference = parsed.data.closingAmount - current.expectedAmount;

    await prisma.cashRegister.update({
      where: { id: current.id },
      data: {
        status: CashRegisterStatus.CLOSED,
        closingAmount: new Prisma.Decimal(parsed.data.closingAmount),
        expectedAmount: new Prisma.Decimal(current.expectedAmount),
        difference: new Prisma.Decimal(difference),
        notes: parsed.data.notes?.trim() || current.notes,
        closedAt: new Date(),
      },
    });

    revalidatePath('/caja');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al cerrar la caja' };
  }
}

export async function addCashMovement(input: CashMovementInput): Promise<ActionResult> {
  requireRole(await auth(), ['ADMIN', 'VENDEDOR']);
  const parsed = cashMovementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const current = await getCurrentCashRegister();
    if (!current) return { ok: false, error: 'No hay caja abierta' };

    await prisma.cashMovement.create({
      data: {
        cashRegisterId: current.id,
        type: parsed.data.type,
        amount: new Prisma.Decimal(parsed.data.amount),
        reason: parsed.data.reason,
        notes: parsed.data.notes?.trim() || null,
      },
    });

    revalidatePath('/caja');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al registrar el movimiento' };
  }
}
