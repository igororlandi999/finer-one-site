import { LogoMark } from '@/components/brand/Logo'
import { useDemoDashboardData } from '@/data/demoDashboard'

export function ChatPreview() {
  const { demoChat } = useDemoDashboardData()

  return (
    <article className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg rounded-br-sm bg-accent/[0.15] px-2.5 py-1.5 text-[12px] leading-snug text-white">
          {demoChat.question}
        </p>
      </div>
      <div className="mt-2.5 flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white">
          <LogoMark className="h-2.5" />
        </span>
        <p className="text-[12px] leading-relaxed text-mist">{demoChat.answer}</p>
      </div>
    </article>
  )
}
