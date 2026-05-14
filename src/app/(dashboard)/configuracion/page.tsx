import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata = { title: 'Configuración' };

export default function ConfiguracionPage() {
  return (
    <PagePlaceholder
      title="Configuración"
      description="Personaliza tu sistema: empresa, impuestos, formatos y preferencias."
      features={[
        'Datos de la empresa (logo, RUC, dirección)',
        'Configuración de IGV y moneda',
        'Formatos de boleta y ticket',
        'Numeración correlativa',
        'Integraciones y APIs externas',
      ]}
    />
  );
}
