import type { Config } from 'tailwindcss'

/**
 * Tokens oficiais da marca Finer One.
 * Não introduzir cores fora desta paleta — apenas variações de opacidade.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#070D2B', // Primary Navy
          deep: '#050A20', // variação para profundidade (topo/rodapé)
          soft: '#0B1338', // variação para superfícies elevadas
        },
        surface: {
          DEFAULT: '#1A2238', // Slate Gray
          soft: '#212B45',
        },
        accent: {
          DEFAULT: '#0052FF', // Accent Blue
          hover: '#1C63FF',
        },
        glow: '#1E90FF', // Glow Blue
        mist: '#A6A6A6', // Light Gray
        /**
         * Token semântico, NÃO faz parte da identidade principal da marca.
         * Uso exclusivo: alertas de risco e estados de aviso.
         * Não utilizar em navegação, CTAs, gráficos ou decoração.
         */
        signal: '#F0B429',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        frame: '0 40px 120px -30px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        card: '0 1px 0 0 rgba(255, 255, 255, 0.04) inset',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.85' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        draw: {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        /**
         * Traço desenhado em unidades de ecrã. Necessário quando o path usa
         * vector-effect="non-scaling-stroke", que ignora pathLength.
         */
        'draw-screen': {
          from: { strokeDashoffset: '640' },
          to: { strokeDashoffset: '0' },
        },
        /**
         * Impulso de informação a percorrer um conector.
         * Em unidades de ecrã, a par de strokeDasharray="6 320".
         */
        flow: {
          from: { strokeDashoffset: '326' },
          to: { strokeDashoffset: '0' },
        },
        /** Versão curta, para os conectores do hub em telemóvel. */
        'flow-short': {
          from: { strokeDashoffset: '126' },
          to: { strokeDashoffset: '0' },
        },
        /** Entrada do painel ao trocar de área do produto. */
        'panel-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        /** Barras a crescer a partir da base. */
        'grow-up': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        /** Barras a crescer a partir da esquerda. */
        'grow-right': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        /**
         * Impulso a percorrer um conector longo da faixa de encerramento.
         * Em unidades de ecrã, a par de strokeDasharray="8 1392": o traço
         * atravessa o caminho inteiro e faz uma pausa antes de repetir.
         */
        'flow-band': {
          from: { strokeDashoffset: '1400' },
          to: { strokeDashoffset: '0' },
        },
        /** Deriva mínima das janelas de origem de dados. */
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.8s ease-out both',
        'glow-breathe': 'glow-breathe 9s ease-in-out infinite',
        'slide-down': 'slide-down 0.22s ease-out both',
        draw: 'draw 1.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'draw-screen': 'draw-screen 1.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        'panel-in': 'panel-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'flow-band': 'flow-band 4.2s linear infinite',
        'grow-up': 'grow-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'grow-right': 'grow-right 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        flow: 'flow 3.4s linear infinite',
        'flow-short': 'flow-short 2.8s linear infinite',
        drift: 'drift 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
