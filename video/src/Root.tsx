import { Composition, Series } from 'remotion'
import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import { loadFont as loadInterTight } from '@remotion/google-fonts/InterTight'
import { LanguageProvider } from '@/i18n/LanguageContext'
import '@/index.css'
import { FPS, HEIGHT, WIDTH } from './lib/constants'
import { HomeScene } from './scenes/HomeScene'
import { CashflowScene } from './scenes/CashflowScene'
import { EarthBackground, EarthSharpSource } from './scenes/EarthBackground'
import { HeroPreview } from './scenes/HeroPreview'
import { HeroSample } from './scenes/HeroSample'
import { HeroSampleV2 } from './scenes/HeroSampleV2'
import { HeroSampleV3 } from './scenes/HeroSampleV3'
import { HeroSampleV4 } from './scenes/HeroSampleV4'
import { HeroMobile, M_H, M_W } from './scenes/HeroMobile'
import { ScreenStill } from './scenes/ScreenStill'
import type { View } from '@/components/v2/finer-ui/AppShell'

function ScreenStillComp({ view }: { view: View }) {
  return (
    <LanguageProvider>
      <ScreenStill view={view} />
    </LanguageProvider>
  )
}

function HeroMobileComp() {
  return (
    <LanguageProvider>
      <HeroMobile />
    </LanguageProvider>
  )
}

function HeroSampleV4Comp() {
  return (
    <LanguageProvider>
      <HeroSampleV4 />
    </LanguageProvider>
  )
}

function HeroSampleV3Comp() {
  return (
    <LanguageProvider>
      <HeroSampleV3 />
    </LanguageProvider>
  )
}

function HeroSampleV2Comp() {
  return (
    <LanguageProvider>
      <HeroSampleV2 />
    </LanguageProvider>
  )
}

function HeroSampleComp() {
  return (
    <LanguageProvider>
      <HeroSample />
    </LanguageProvider>
  )
}

// Tipografia oficial: Inter (texto) e Inter Tight (títulos).
loadInter('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext'] })
loadInterTight('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] })

function Sample() {
  return (
    <LanguageProvider>
      <Series>
        <Series.Sequence durationInFrames={300}>
          <HomeScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <CashflowScene />
        </Series.Sequence>
      </Series>
    </LanguageProvider>
  )
}

export function Root() {
  return (
    <>
      {/* Amostra do Vídeo A (hero): pergunta → resposta → linha azul → Finer Advisor, 10 s. */}
      <Composition id="HeroSample" component={HeroSampleComp} durationInFrames={300} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* Product Film 2.0: linha cometa, escrita humana, profundidade e loop sem corte, 10 s. */}
      <Composition id="HeroSampleV2" component={HeroSampleV2Comp} durationInFrames={300} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* Versão final da homepage: o clique em "Ver plano de ação" abre o Advisor, 10 s. */}
      <Composition id="HeroSampleV3" component={HeroSampleV3Comp} durationInFrames={300} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="HeroSampleV4" component={HeroSampleV4Comp} durationInFrames={300} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="HeroMobile" component={HeroMobileComp} durationInFrames={300} fps={FPS} width={M_W} height={M_H} />
      {/* Ecrã estático para o storyboard (--props='{"view":"receitas"}'). */}
      <Composition id="ScreenStill" component={ScreenStillComp} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ view: 'home' as View }} />
      {/* Amostra anterior: Finer Home → Cashflow, 17 s. */}
      {/* Fundo cinematográfico da Hero: Terra em loop de 14 s. */}
      <Composition id="EarthSharpSource" component={EarthSharpSource} durationInFrames={1} fps={FPS} width={2244} height={1120} />
      <Composition id="HeroEarth" component={EarthBackground} durationInFrames={420} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* Pré-visualização animada da Hero completa (1440×900). */}
      <Composition id="HeroPreview" component={() => (<LanguageProvider><HeroPreview /></LanguageProvider>)} durationInFrames={240} fps={FPS} width={1440} height={900} />
      <Composition id="FinerOneSample" component={Sample} durationInFrames={510} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  )
}
