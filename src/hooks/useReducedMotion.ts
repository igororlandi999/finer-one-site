import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Substituto do useReducedMotion do motion, seguro para a hidratação: no HTML pré-renderizado e
 * durante a hidratação vale false; logo a seguir, o valor real (sistema ou ?motion=reduce).
 * O do motion lia logo o valor real no primeiro render, o que fazia o React reconstruir a página
 * para quem tem movimento reduzido. Os efeitos que dependem dele voltam a correr quando muda.
 */
export function useReducedMotion(): boolean {
  return usePrefersReducedMotion()
}
