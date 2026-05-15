import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import { MotionProvider } from '@/components/providers/motion-provider';
import { Toaster } from '@/components/ui/sonner';
import { APP_NAME } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} · Sistema de Inventario`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Sistema profesional de gestión de inventario para ferreterías. Productos, ventas, caja, reportes y más.',
  keywords: ['ferretería', 'inventario', 'POS', 'ventas', 'stock', 'kardex'],
  authors: [{ name: 'Ferretería Pro' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <MotionProvider>
            <SessionProvider>
              {children}
              <Toaster />
            </SessionProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
