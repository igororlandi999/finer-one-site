import path from 'node:path'
import { Config } from '@remotion/cli/config'
import { enableTailwind } from '@remotion/tailwind'

/**
 * O vídeo reutiliza os componentes reais do site (../src) — a interface no
 * vídeo é exatamente a mesma do website. Usa-se uma única cópia do React (a
 * do site) para o Remotion e para os componentes.
 */
const site = path.resolve(process.cwd(), '..')
const mod = (...p: string[]) => path.join(site, 'node_modules', ...p)

Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(92)
Config.setOverwriteOutput(true)

Config.overrideWebpackConfig((current) => {
  const withTailwind = enableTailwind(current, { configLocation: path.join(process.cwd(), 'tailwind.config.ts') })
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...(withTailwind.resolve?.alias ?? {}),
        '@': path.join(site, 'src'),
        react: mod('react'),
        'react/jsx-runtime': mod('react', 'jsx-runtime.js'),
        'react/jsx-dev-runtime': mod('react', 'jsx-dev-runtime.js'),
        'react-dom': mod('react-dom'),
        'react-dom/client': mod('react-dom', 'client.js'),
        'react-dom/server': mod('react-dom', 'server.browser.js'),
      },
    },
  }
})
