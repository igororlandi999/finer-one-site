import { Composition, Series } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Montserrat'
import { LanguageProvider } from '@/i18n/LanguageContext'
import '@/index.css'
import { FPS, HEIGHT, WIDTH } from './lib/constants'
import { HomeScene } from './scenes/HomeScene'
import { CashflowScene } from './scenes/CashflowScene'
import { EarthBackground } from './scenes/EarthBackground'
import { HeroPreview } from './scenes/HeroPreview'
import { HeroSample } from './scenes/HeroSample'
import { ScreenStill } from './scenes/ScreenStill'
import type { View } from '@/components/v2/finer-ui/AppShell'

function ScreenStillComp({ view }: { view: View }) {
  return (
    <LanguageProvider>
      <ScreenStill view={view} />
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

loadFont('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] })

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
      {/* Ecrã estático para o storyboard (--props='{"view":"receitas"}'). */}
      <Composition id="ScreenStill" component={ScreenStillComp} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ view: 'home' as View }} />
      {/* Amostra anterior: Finer Home → Cashflow, 17 s. */}
      {/* Fundo cinematográfico da Hero: Terra em loop de 14 s. */}
      <Composition id="HeroEarth" component={EarthBackground} durationInFrames={420} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* Pré-visualização animada da Hero completa (1440×900). */}
      <Composition id="HeroPreview" component={() => (<LanguageProvider><HeroPreview /></LanguageProvider>)} durationInFrames={240} fps={FPS} width={1440} height={900} />
      <Composition id="FinerOneSample" component={Sample} durationInFrames={510} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  )
}
