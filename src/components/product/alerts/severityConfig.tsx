import { CircleAlert, Info, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AlertSeverity } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'

type SeverityConfig = Record<
  AlertSeverity,
  { label: string; icon: LucideIcon; bar: string; badge: string; iconChip: string; text: string }
>

/**
 * A marca não tem um vermelho oficial (ver tailwind.config.ts) — "crítico" e
 * "atenção" usam o mesmo âmbar (signal), diferenciados pelo peso visual
 * (crítico = badge/ícone cheios; atenção = versão translúcida, igual ao
 * resto do produto). "Informativo" usa o azul (glow) de sempre.
 */
const labels = {
  pt: { critical: 'Crítico', warning: 'Atenção', info: 'Informativo' },
  en: { critical: 'Critical', warning: 'Warning', info: 'Info' },
}

export function useSeverityConfig(): SeverityConfig {
  const { lang } = useLanguage()
  const t = labels[lang]

  return {
    critical: {
      label: t.critical,
      icon: CircleAlert,
      bar: 'bg-signal',
      badge: 'border-signal/[0.55] bg-signal/[0.24] text-signal',
      iconChip: 'bg-signal text-navy-deep',
      text: 'text-signal',
    },
    warning: {
      label: t.warning,
      icon: TriangleAlert,
      bar: 'bg-signal/60',
      badge: 'border-signal/[0.35] bg-signal/[0.12] text-signal',
      iconChip: 'bg-signal/[0.14] text-signal',
      text: 'text-signal',
    },
    info: {
      label: t.info,
      icon: Info,
      bar: 'bg-glow',
      badge: 'border-accent/[0.35] bg-accent/[0.12] text-glow',
      iconChip: 'bg-accent/[0.14] text-glow',
      text: 'text-glow',
    },
  }
}
