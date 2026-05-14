import type { Metadata } from 'next';
import { Hammer, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { LoginForm } from '@/components/forms/login-form';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

const features = [
  { icon: Zap, label: 'POS rápido', desc: 'Ventas en segundos con escáner QR' },
  { icon: BarChart3, label: 'Reportes en vivo', desc: 'Decisiones con datos al instante' },
  { icon: ShieldCheck, label: 'Control de stock', desc: 'Alertas y kardex automático' },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel visual industrial */}
      <aside className="relative hidden overflow-hidden bg-industrial-black text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 30%, #FACC15 0%, transparent 30%), radial-gradient(circle at 75% 70%, #2563EB 0%, transparent 35%)',
          }}
        />
        <div aria-hidden className="absolute inset-0 industrial-pattern opacity-[0.04]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold">{APP_NAME}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Inventory Suite</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Sistema en producción
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Tu ferretería,
              <br />
              <span className="text-primary">bajo control total.</span>
            </h1>
            <p className="mt-4 max-w-md text-white/60">
              Gestión profesional de inventario, ventas, caja y proveedores. Diseñado para
              ferreterías que crecen en serio.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{f.label}</p>
                    <p className="text-xs text-white/50">{f.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} {APP_NAME}. Hecho con precisión industrial.
        </p>
      </aside>

      {/* Form */}
      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg lg:hidden">
              <Hammer className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Bienvenido de vuelta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 rounded-lg border border-dashed bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground">
              Credenciales de prueba:
            </p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Admin:</strong> admin@ferreteria.com /
                admin123
              </p>
              <p>
                <strong className="text-foreground">Vendedor:</strong>{' '}
                vendedor@ferreteria.com / vendedor123
              </p>
              <p>
                <strong className="text-foreground">Almacén:</strong> almacen@ferreteria.com /
                almacen123
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
