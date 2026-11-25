import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Finer Pioneers — página /pioneers/confirmar/ (verificação do email do candidato).
// Só é gerada com VITE_PIONEERS_EMAIL_VERIFICATION=on. Enquanto a verificação estiver desligada
// (sem CONFIRM_FROM no Worker), a página não existe no site publicado: nada de exposto nem prometido.
// Ordem ao ativar: 1) esta variável no GitHub + publicar o site; 2) só depois CONFIRM_FROM no Worker.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const verification = (process.env.VITE_PIONEERS_EMAIL_VERIFICATION ?? env.VITE_PIONEERS_EMAIL_VERIFICATION) === 'on'
  // Mês do build (AAAA-MM, UTC): o simulador do Explorar usa-o no HTML pré-renderizado e na
  // hidratação, e passa ao mês atual do visitante logo a seguir (src/hooks/useCurrentMonth.ts).
  // A pré-renderização reutiliza o valor do build do site (scripts/prerender.mjs).
  const buildMonth = process.env.FO_BUILD_MONTH || new Date().toISOString().slice(0, 7)

  return {
  base: '/',

  plugins: [react()],

  define: { __FO_BUILD_MONTH__: JSON.stringify(buildMonth) },

  // Várias páginas: cada uma com o seu index.html (funciona no GitHub Pages).
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        pioneers: fileURLToPath(new URL('./pioneers/index.html', import.meta.url)),
        ...(verification ? { pioneersConfirmar: fileURLToPath(new URL('./pioneers/confirmar/index.html', import.meta.url)) } : {}),
        listaEspera: fileURLToPath(new URL('./lista-espera/index.html', import.meta.url)),
        privacidade: fileURLToPath(new URL('./privacidade/index.html', import.meta.url)),
        sobre: fileURLToPath(new URL('./sobre/index.html', import.meta.url)),
        explorar: fileURLToPath(new URL('./explorar/index.html', import.meta.url)),
        guiaFaltaLiquidez: fileURLToPath(new URL('./guias/falta-de-liquidez/index.html', import.meta.url)),
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  }
})