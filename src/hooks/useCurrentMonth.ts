import { useSyncExternalStore } from 'react'

const noop = () => () => {}
let cached: string | null = null

/** "AAAA-MM" do mês atual do visitante (valor estável entre chamadas, como pede o useSyncExternalStore). */
function current(): string {
  const d = new Date()
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  if (key !== cached) cached = key
  return cached
}

/**
 * Mês de referência das datas mostradas (ano e mês, 0-11).
 *
 * No HTML pré-renderizado e na hidratação usa o mês do build; logo a seguir passa ao mês atual
 * do visitante. Assim, uma página publicada num mês e visitada no seguinte é hidratada sem
 * diferenças (o React não tem de a reconstruir) e mostra os meses certos.
 */
export function useCurrentMonth(): { year: number; month: number } {
  const key = useSyncExternalStore(noop, current, () => __FO_BUILD_MONTH__)
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}
