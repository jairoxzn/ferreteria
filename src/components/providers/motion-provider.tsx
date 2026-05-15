'use client';

import { MotionConfig } from 'framer-motion';

// Respeta prefers-reduced-motion del sistema operativo (WCAG 2.3.3).
// "user" → si el usuario activó reduce-motion, framer-motion saltará animaciones
// pero conserva opacidad/colores. Aplica a todos los motion.* de la app.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
