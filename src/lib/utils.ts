import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'PEN';
const LOCALE = 'es-PE';

export function formatCurrency(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(LOCALE).format(num);
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...opts,
  }).format(d);
}

export function formatDateTime(date: Date | string) {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const intervals = [
    { label: 'año', seconds: 31536000 },
    { label: 'mes', seconds: 2592000 },
    { label: 'día', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) return `hace ${count} ${interval.label}${count > 1 ? 's' : ''}`;
  }
  return 'hace un momento';
}

export function generateSKU(prefix = 'PROD') {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rnd = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${ts}${rnd}`;
}

export function generateSaleCode(seq: number) {
  return `V-${seq.toString().padStart(6, '0')}`;
}

export function generateCashCode(seq: number) {
  return `C-${seq.toString().padStart(5, '0')}`;
}
