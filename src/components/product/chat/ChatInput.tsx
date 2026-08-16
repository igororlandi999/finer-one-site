import { Send } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: {
    placeholder: 'Faça uma pergunta sobre a empresa...',
    send: 'Enviar pergunta',
    disclaimer:
      'As respostas são geradas com base nos dados financeiros e devem ser validadas quando materialmente relevantes.',
  },
  en: {
    placeholder: 'Ask a question about the company...',
    send: 'Send question',
    disclaimer: 'Answers are generated from financial data and should be validated when materially relevant.',
  },
}

export function ChatInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <div>
      <form
        className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.02] p-1.5"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t.placeholder}
          className="min-w-0 flex-1 bg-transparent px-1.5 text-[11px] text-white placeholder:text-mist focus:outline-none"
        />
        <button
          type="submit"
          aria-label={t.send}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-colors duration-200 hover:bg-accent-hover"
        >
          <Send size={13} aria-hidden="true" />
        </button>
      </form>
      <p className="mt-1 text-[9px] text-mist">{t.disclaimer}</p>
    </div>
  )
}
