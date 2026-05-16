'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import {
  createUserSchema,
  updateUserSchema,
  passwordResetSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type PasswordResetInput,
} from '@/lib/validations/user';
import type { ActionResult } from './categories';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar: string | null;
  active: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

export async function getUsers(): Promise<UserRow[]> {
  await requireRole(['ADMIN']);
  const rows = await prisma.user.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      active: true,
      lastLogin: true,
      createdAt: true,
    },
  });
  return rows;
}

export async function createUser(input: CreateUserInput): Promise<ActionResult<{ id: string }>> {
  await requireRole(['ADMIN']);
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const hashed = await bcrypt.hash(parsed.data.password, 10);
    const created = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: parsed.data.email,
        role: parsed.data.role,
        password: hashed,
        phone: parsed.data.phone?.trim() || null,
        active: parsed.data.active,
      },
    });
    revalidatePath('/usuarios');
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un usuario con ese email' };
    }
    return { ok: false, error: 'Error al crear el usuario' };
  }
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<ActionResult> {
  await requireRole(['ADMIN']);
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const data: Prisma.UserUpdateInput = {
      name: parsed.data.name?.trim(),
      email: parsed.data.email,
      role: parsed.data.role,
      phone: parsed.data.phone?.trim() || null,
      active: parsed.data.active,
    };

    if (parsed.data.password) {
      data.password = await bcrypt.hash(parsed.data.password, 10);
    }

    await prisma.user.update({ where: { id }, data });
    revalidatePath('/usuarios');
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un usuario con ese email' };
    }
    return { ok: false, error: 'Error al actualizar el usuario' };
  }
}

export async function resetPassword(id: string, input: PasswordResetInput): Promise<ActionResult> {
  await requireRole(['ADMIN']);
  const parsed = passwordResetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? 'Inválido' };

  try {
    const hashed = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al restablecer la contraseña' };
  }
}

export async function toggleUserActive(id: string): Promise<ActionResult> {
  const session = await requireRole(['ADMIN']);
  if (session.user.id === id) {
    return { ok: false, error: 'No puedes desactivarte a ti mismo' };
  }
  try {
    const u = await prisma.user.findUnique({ where: { id }, select: { active: true } });
    if (!u) return { ok: false, error: 'Usuario no encontrado' };
    await prisma.user.update({ where: { id }, data: { active: !u.active } });
    revalidatePath('/usuarios');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al cambiar el estado' };
  }
}
