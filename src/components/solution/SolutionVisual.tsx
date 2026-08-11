import { ConnectVisual } from '@/components/solution/ConnectVisual'
import { OrganizeVisual } from '@/components/solution/OrganizeVisual'
import { InterpretVisual } from '@/components/solution/InterpretVisual'
import { DecideVisual } from '@/components/solution/DecideVisual'
import type { SolutionStepId } from '@/data/solutionSection'

/**
 * Seletor da cena. Cada visual recebe apenas `active` e trata das suas
 * próprias transições — o mesmo componente serve o painel fixo do desktop e
 * a versão em fluxo do telemóvel.
 */
export function SolutionVisual({ id, active }: { id: SolutionStepId; active: boolean }) {
  switch (id) {
    case 'conectar':
      return <ConnectVisual active={active} />
    case 'organizar':
      return <OrganizeVisual active={active} />
    case 'interpretar':
      return <InterpretVisual active={active} />
    case 'decidir':
      return <DecideVisual active={active} />
  }
}
