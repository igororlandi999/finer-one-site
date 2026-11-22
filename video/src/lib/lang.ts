import { getInputProps } from 'remotion'

/**
 * Língua do vídeo: `--props='{"lang":"en"}'` gera a versão inglesa.
 * Os componentes do site leem a língua do localStorage, por isso fica definida
 * antes de qualquer cena ser desenhada.
 */
export const LANG: 'pt' | 'en' = (getInputProps() as { lang?: string }).lang === 'en' ? 'en' : 'pt'
try {
  window.localStorage.setItem('finer-one-lang', LANG)
} catch {
  /* sem armazenamento: fica em PT */
}

export const SCRIPT = LANG === 'en'
  ? { question: 'How is my company’s cash position?', answer: 'There is €50,948.60 in overdue invoices and one customer accounts for 88.3% of it.' }
  : { question: 'Como está a tesouraria da minha empresa?', answer: 'Há € 50.948,60 em faturas em atraso e um cliente concentra 88,3% deste valor.' }
