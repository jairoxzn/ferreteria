'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';
import { settingsSchema, type SettingsInput } from '@/lib/validations/settings';
import type { ActionResult } from './categories';

export interface SettingsData {
  companyName: string | null;
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  igv: number;
  currency: string;
  ticketHeader: string | null;
  ticketFooter: string | null;
}

const DEFAULT_SETTINGS: SettingsData = {
  companyName: null,
  ruc: null,
  address: null,
  phone: null,
  email: null,
  logo: null,
  igv: 0.18,
  currency: 'PEN',
  ticketHeader: null,
  ticketFooter: null,
};

export async function getSettings(): Promise<SettingsData> {
  await requireAuth();
  const s = await prisma.settings.findUnique({ where: { id: 'default' } });
  if (!s) return DEFAULT_SETTINGS;
  return {
    companyName: s.companyName,
    ruc: s.ruc,
    address: s.address,
    phone: s.phone,
    email: s.email,
    logo: s.logo,
    igv: s.igv.toNumber(),
    currency: s.currency,
    ticketHeader: s.ticketHeader,
    ticketFooter: s.ticketFooter,
  };
}

export async function updateSettings(input: SettingsInput): Promise<ActionResult> {
  await requireRole(['ADMIN']);
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const data = {
      companyName: parsed.data.companyName?.trim() || null,
      ruc: parsed.data.ruc?.trim() || null,
      address: parsed.data.address?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      email: parsed.data.email?.trim() || null,
      logo: parsed.data.logo?.trim() || null,
      igv: new Prisma.Decimal(parsed.data.igv),
      currency: parsed.data.currency.toUpperCase(),
      ticketHeader: parsed.data.ticketHeader?.trim() || null,
      ticketFooter: parsed.data.ticketFooter?.trim() || null,
    };

    await prisma.settings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    });

    revalidatePath('/configuracion');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al guardar la configuración' };
  }
}
