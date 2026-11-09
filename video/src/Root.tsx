import { Composition } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Montserrat'
import { LanguageProvider } from '@/i18n/LanguageContext'
import '@/index.css'
import { FPS, HEIGHT, WIDTH } from './lib/constants'
import { HomeScene } from './scenes/HomeScene'
import { EarthBackground } from './scenes/EarthBackground'
import { HeroPreview } from './scenes/HeroPreview'

loadFont('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] })

function Sample() {
  return (
    <LanguageProvider>
      <HomeScene />
    </LanguageProvider>
  )
}

export function Root() {
  return (
    <>
      {/* Amostra de estilo para aprovação: cenas 1 e 2 (9 s). */}
      {/* Fundo cinematográfico da Hero: Terra em loop de 14 s. */}
      <Composition id="HeroEarth" component={EarthBackground} durationInFrames={420} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* Pré-visualização animada da Hero completa (1440×900). */}
      <Composition id="HeroPreview" component={() => (<LanguageProvider><HeroPreview /></LanguageProvider>)} durationInFrames={240} fps={FPS} width={1440} height={900} />
      <Composition id="FinerOneSample" component={Sample} durationInFrames={270} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  )
}
