import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/',

  plugins: [react()],

  // Várias páginas: cada uma com o seu index.html (funciona no GitHub Pages).
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        pioneers: fileURLToPath(new URL('./pioneers/index.html', import.meta.url)),
        listaEspera: fileURLToPath(new URL('./lista-espera/index.html', import.meta.url)),
        privacidade: fileURLToPath(new URL('./privacidade/index.html', import.meta.url)),
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})