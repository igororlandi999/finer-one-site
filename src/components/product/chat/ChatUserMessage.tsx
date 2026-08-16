import { CheckCheck } from 'lucide-react'

export function ChatUserMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-lg rounded-br-sm bg-accent/[0.15] px-2.5 py-1.5">
        <p className="text-[11.5px] leading-snug text-white">{text}</p>
        <p className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-mist">
          {time}
          <CheckCheck size={10} aria-hidden="true" />
        </p>
      </div>
    </div>
  )
}
