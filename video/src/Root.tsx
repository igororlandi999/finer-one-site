import { Composition } from 'remotion'
import { loadFont } from '@remotion/google-fonts/Montserrat'
import { LanguageProvider } from '@/i18n/LanguageContext'
import '@/index.css'
import { FPS, HEIGHT, WIDTH } from './lib/constants'
import { HomeScene } from './scenes/HomeScene'

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
      <Composition id="FinerOneSample" component={Sample} durationInFrames={270} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  )
}
