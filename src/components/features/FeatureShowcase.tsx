import type { ComponentType } from 'react'
import { FeatureFrame } from '@/components/features/FeatureFrame'
import { PerformanceAside, PerformanceVisual } from '@/components/features/visuals/PerformanceVisual'
import { CashflowAside, CashflowVisual } from '@/components/features/visuals/CashflowVisual'
import { AlertsAside, AlertsVisual } from '@/components/features/visuals/AlertsVisual'
import { ClientsAside, ClientsVisual } from '@/components/features/visuals/ClientsVisual'
import { DocumentsAside, DocumentsVisual } from '@/components/features/visuals/DocumentsVisual'
import { ChatAside, ChatVisual } from '@/components/features/visuals/ChatVisual'
import type { Feature, FeatureId } from '@/data/featuresSection'

/**
 * Registo das interfaces. Só a área ativa é montada — nenhuma das outras
 * cinco existe no DOM nem corre animações em segundo plano.
 */
const registry: Record<FeatureId, { Main: ComponentType; Aside: ComponentType }> = {
  performance: { Main: PerformanceVisual, Aside: PerformanceAside },
  cashflow: { Main: CashflowVisual, Aside: CashflowAside },
  alertas: { Main: AlertsVisual, Aside: AlertsAside },
  clientes: { Main: ClientsVisual, Aside: ClientsAside },
  documentos: { Main: DocumentsVisual, Aside: DocumentsAside },
  chat: { Main: ChatVisual, Aside: ChatAside },
}

/**
 * Título da área, moldura do produto e visual secundário.
 *
 * A `key` no conteúdo força a remontagem ao trocar de área, o que reinicia as
 * animações internas; a moldura em si nunca é desmontada, por isso a
 * composição não pisca nem salta de altura.
 *
 * A partir de lg o visual secundário sobrepõe-se ao canto inferior direito da
 * moldura e sai parcialmente para fora dela. É ancorado pelo topo e não pelo
 * fundo: assim a sobreposição é sempre a mesma independentemente da altura do
 * card, e nunca cobre conteúdo do visual principal.
 *
 * O bloco de contenção do absolute é a própria moldura e não o contentor com
 * padding: com o padding lá dentro, o top: calc(100% - Npx) media a partir do
 * fim do padding e o card acabava a começar *abaixo* da moldura, isolado numa
 * faixa vazia. Medindo a partir da moldura, os 72px de sobreposição coincidem
 * exatamente com a banda livre reservada em FeatureFrame (lg:pb-[72px]) — o
 * card assenta sobre espaço já vazio e não tapa nada.
 *
 * A folga inferior é fixa e dimensionada pelo card mais alto (Documentos): tem
 * de ser fixa para a fila de tabs não saltar ao trocar de área.
 */
export function FeatureShowcase({ feature }: { feature: Feature }) {
  const { Main, Aside } = registry[feature.id]

  return (
    <div>
      <div key={`${feature.id}-texto`} className="animate-panel-in lg:min-h-[122px]">
        <h3 className="max-w-[26ch] font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-white sm:text-[24px] lg:text-[27px]">
          {feature.headline}
        </h3>
        <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-mist">
          {feature.description}
        </p>
      </div>

      <div className="mt-7 lg:pb-[180px]">
        <div className="relative">
          <FeatureFrame name={feature.name} context={feature.context}>
            <div key={`${feature.id}-principal`} className="h-full animate-panel-in">
              <Main />
            </div>
          </FeatureFrame>

          <div
            key={`${feature.id}-secundario`}
            className="mt-3 animate-panel-in lg:absolute lg:right-7 lg:top-[calc(100%-72px)] lg:mt-0 lg:w-[292px] xl:right-10"
            style={{ animationDelay: '160ms' }}
          >
            <div className="rounded-xl border border-white/[0.1] bg-navy-soft/95 p-4 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.95)] backdrop-blur-sm">
              <Aside />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
