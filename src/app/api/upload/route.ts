import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!['ADMIN', 'ALMACEN'].includes(session.user.role))
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: 'BLOB_READ_WRITE_TOKEN no configurado. Crea un Blob Store en Vercel y conéctalo al proyecto.',
      },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get('file');
  const folder = (form.get('folder') as string | null) ?? 'products';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo no recibido' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Imagen demasiado grande (máx 5 MB)' }, { status: 413 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no permitido' }, { status: 415 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(fileName, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!['ADMIN', 'ALMACEN'].includes(session.user.role))
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN no configurado' }, { status: 503 });
  }

  const { url } = (await request.json()) as { url?: string };
  if (!url) return NextResponse.json({ error: 'URL requerida' }, { status: 400 });

  await del(url);
  return NextResponse.json({ ok: true });
}
