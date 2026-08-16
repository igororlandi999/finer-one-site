import { useState } from 'react'
import { Activity, ChevronRight, CircleCheck, Copy, Target, ThumbsDown, ThumbsUp } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import type { DemoDashboardContent } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: {
    brand: 'Finer IA',
    conclusion: 'Conclusão',
    impact: 'Impacto',
    action: 'Ação recomendada',
    application: 'Aplicação',
    copied: 'Copiado',
    helpful: 'Resposta útil',
    notHelpful: 'Resposta pouco útil',
    copy: 'Copiar resposta',
  },
  en: {
    brand: 'Finer AI',
    conclusion: 'Conclusion',
    impact: 'Impact',
    action: 'Recommended action',
    application: 'Application',
    copied: 'Copied',
    helpful: 'Helpful answer',
    notHelpful: 'Not helpful',
    copy: 'Copy answer',
  },
}

export function FinerAIResponse({ answer }: { answer: DemoDashboardContent['demoChatAnswer'] }) {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [copied, setCopied] = useState(false)

  const blocks = [
    { icon: CircleCheck, title: t.conclusion, text: answer.conclusion },
    { icon: Activity, title: t.impact, text: answer.impact },
    { icon: Target, title: t.action, text: answer.recommendation },
    { icon: ChevronRight, title: t.application, text: answer.application },
  ]

  const handleCopy = () => {
    const fullText = blocks.map((block) => `${block.title}: ${block.text}`).join('\n\n')
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/[0.16] text-glow">
          <LogoMark className="h-2.5" />
        </span>
        <p className="text-[11px] font-semibold text-white">
          {t.brand}
          <span className="ml-1.5 font-normal text-mist">{answer.time}</span>
        </p>
      </div>

      <div className="mt-2 grid gap-x-3 gap-y-1.5 sm:grid-cols-2">
        {blocks.map((block) => (
          <p key={block.title} className="flex items-start gap-1.5 text-[10.5px] leading-snug text-mist">
            <block.icon size={11} className="mt-0.5 shrink-0 text-glow" aria-hidden="true" />
            <span>
              <span className="font-semibold text-glow">{block.title}: </span>
              {block.text}
            </span>
          </p>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-white/[0.06] pt-1.5">
        {copied ? <span className="text-[9px] text-glow">{t.copied}</span> : null}
        <button
          type="button"
          aria-label={t.helpful}
          className="rounded-md p-1 text-mist transition-colors duration-200 hover:text-white"
        >
          <ThumbsUp size={11} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t.notHelpful}
          className="rounded-md p-1 text-mist transition-colors duration-200 hover:text-white"
        >
          <ThumbsDown size={11} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t.copy}
          onClick={handleCopy}
          className="rounded-md p-1 text-mist transition-colors duration-200 hover:text-white"
        >
          <Copy size={11} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
