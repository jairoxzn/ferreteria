'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ value, onChange, folder = 'products', disabled, className }: Props) {
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona un archivo de imagen válido');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set('file', file);
      fd.set('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al subir la imagen');
      onChange(json.url);
      toast.success('Imagen subida');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const handleRemove = async () => {
    if (!value) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });
    } catch {
      // ignore — todavía limpiamos del form
    }
    onChange(null);
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="group relative overflow-hidden rounded-lg border bg-muted/40">
          <div className="relative aspect-square w-full">
            <Image
              src={value}
              alt="Imagen del producto"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/70 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Cambiar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={disabled || uploading}
          className={cn(
            'flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 transition-colors',
            'hover:border-primary hover:bg-primary/5',
            dragOver && 'border-primary bg-primary/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Subiendo...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-xs font-medium">Subir imagen</p>
              <p className="text-[10px] text-muted-foreground">PNG · JPG · WebP · 5 MB</p>
            </>
          )}
        </button>
      )}
    </div>
  );
}
