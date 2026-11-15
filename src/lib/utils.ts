import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Move o foco para `id` depois de `delay` ms, mas só se a pessoa não tiver mudado de campo
 * entretanto. Evita que um foco agendado (ex.: "ir para o primeiro erro") roube o foco a quem
 * já está a escrever noutro campo — o texto acabaria no campo errado.
 */
export function focusLater(id: string, delay: number, options?: FocusOptions) {
  const before = document.activeElement
  window.setTimeout(() => {
    const now = document.activeElement
    if (now !== before && now !== document.body && now !== null) return
    document.getElementById(id)?.focus(options)
  }, delay)
}
