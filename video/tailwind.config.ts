import base from '../tailwind.config'

/** Mesmos tokens da marca; procura classes no site e nas cenas do vídeo. */
export default {
  ...base,
  content: ['../src/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
}
