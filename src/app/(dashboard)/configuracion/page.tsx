import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { auth } from '@/auth';
import { requireRole } from '@/lib/auth-helpers';
import { getSettings } from '@/actions/settings';
import { SettingsForm } from '@/components/settings/settings-form';

export const metadata: Metadata = { title: 'Configuración' };
export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  requireRole(await auth(), ['ADMIN']);
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Configuración
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Personaliza los datos de tu empresa y comprobantes
          </p>
        </div>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}
