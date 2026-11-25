import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowRight, CheckCircle2, Clock, Info, MailCheck, MailQuestion, Send, TriangleAlert } from 'lucide-react'
import { Field, TextInput } from '@/components/forms/fields'
import { buttonClasses } from '@/components/ui/Button'
import { CONTACT_EMAIL } from '@/config/contact'
import { useLanguage } from '@/i18n/LanguageContext'
import { devFlags } from '@/lib/devFlags'
import { isValidEmail, requestConfirmationLink, verifyEmail } from '@/lib/forms'
import type { ResendOutcome } from '@/lib/forms'
import { cn } from '@/lib/utils'

/**
 * Finer Pioneers — confirmação do email do candidato (/pioneers/confirmar/).
 *
 * A ligação do email traz o token no fragmento (#t=…): nunca chega a um servidor por
 * endereço. A página guarda-o em memória, limpa-o da barra de endereços e só o envia (POST)
 * quando a pessoa carrega em "Confirmar email" — os filtros de email que abrem ligações não
 * gastam a ligação. A confirmação é decidida no recetor; aqui só se mostra o resultado.
 *
 * Nunca mostra dados da candidatura nem o estado de avaliação: quem abre esta página não
 * está autenticado.
 *
 * Em desenvolvimento, ?estado=<nome> mostra cada estado sem chamar o recetor:
 * ready, verifying, verified, already, expired, invalid, error, request, requested, unavailable.
 */
type State = 'ready' | 'verifying' | 'verified' | 'already' | 'expired' | 'invalid' | 'error' | 'request' | 'requested' | 'unavailable'
const STATES: State[] = ['ready', 'verifying', 'verified', 'already', 'expired', 'invalid', 'error', 'request', 'requested', 'unavailable']

const copy = {
  pt: {
    kicker: 'Finer Pioneers · Confirmação de email',
    ready: { title: 'Confirme o seu email', body: 'Falta um passo para concluir a verificação do contacto da sua candidatura ao Finer Pioneers.' },
    confirm: 'Confirmar email',
    verifying: 'A confirmar…',
    verified: { title: 'Email confirmado.', body: 'Obrigado. O endereço de email da sua candidatura está verificado. A equipa vai analisar a candidatura e contactará os empresários selecionados.' },
    already: { title: 'Este email já estava confirmado.', body: 'Não precisa de fazer mais nada. A equipa vai analisar a candidatura e contactará os empresários selecionados.' },
    expired: { title: 'Esta ligação expirou.', body: 'As ligações de confirmação são válidas durante 48 horas. Podemos enviar-lhe uma nova para o mesmo endereço.' },
    sendNew: 'Enviar nova ligação',
    sending: 'A enviar…',
    invalid: { title: 'Não foi possível verificar esta ligação.', body: 'A ligação pode estar incompleta ou já não ter efeito. Abra a ligação mais recente que recebeu, ou peça uma nova.' },
    error: { title: 'Não foi possível concluir a confirmação.', body: 'Verifique a sua ligação à internet e tente novamente dentro de momentos. A sua candidatura não foi afetada.' },
    retry: 'Tentar novamente',
    request: { title: 'Pedir nova ligação de confirmação', body: 'Indique o email que usou na candidatura ao Finer Pioneers.' },
    email: 'Email da candidatura',
    emailPh: 'nome@empresa.pt',
    emailError: 'Indique um email válido.',
    requested: { title: 'Pedido registado.', body: 'Se existir uma candidatura por confirmar com este endereço, enviámos uma nova ligação. É válida durante 48 horas; veja também a pasta de spam.' },
    limits: 'Por segurança, o número de reenvios é limitado. Se não receber o email, escreva-nos para ',
    unavailable: { title: 'Confirmação temporariamente indisponível.', body: 'Não foi possível contactar o serviço de confirmação. A sua candidatura não foi afetada. Tente mais tarde ou escreva-nos para ' },
    failures: {
      rate: 'Recebemos muitos pedidos neste momento. Tente novamente dentro de alguns minutos.',
      network: 'Não foi possível enviar o pedido. Verifique a ligação e tente novamente.',
      verification: 'Não foi possível validar o pedido. Atualize a página e tente novamente.',
      invalid: 'Não foi possível usar esta ligação. Indique o email da candidatura para pedir uma nova.',
    },
    note: 'A confirmação do email não é uma decisão sobre a candidatura.',
    other: 'Não recebeu o email? Pedir nova ligação',
    backHome: 'Voltar à página inicial',
    toProgram: 'Ver o programa Finer Pioneers',
  },
  en: {
    kicker: 'Finer Pioneers · Email confirmation',
    ready: { title: 'Confirm your email', body: 'One step left to verify the contact details of your Finer Pioneers application.' },
    confirm: 'Confirm email',
    verifying: 'Confirming…',
    verified: { title: 'Email confirmed.', body: 'Thank you. The email address of your application is verified. The team will review your application and contact the selected business owners.' },
    already: { title: 'This email was already confirmed.', body: 'There is nothing else you need to do. The team will review your application and contact the selected business owners.' },
    expired: { title: 'This link has expired.', body: 'Confirmation links are valid for 48 hours. We can send a new one to the same address.' },
    sendNew: 'Send a new link',
    sending: 'Sending…',
    invalid: { title: 'We could not verify this link.', body: 'The link may be incomplete or no longer active. Open the most recent link you received, or ask for a new one.' },
    error: { title: 'We could not complete the confirmation.', body: 'Check your internet connection and try again in a moment. Your application has not been affected.' },
    retry: 'Try again',
    request: { title: 'Request a new confirmation link', body: 'Enter the email you used in your Finer Pioneers application.' },
    email: 'Application email',
    emailPh: 'name@company.com',
    emailError: 'Please enter a valid email.',
    requested: { title: 'Request received.', body: 'If there is an application awaiting confirmation for this address, we have sent a new link. It is valid for 48 hours; please check your spam folder too.' },
    limits: 'For security, the number of resends is limited. If the email does not arrive, write to us at ',
    unavailable: { title: 'Confirmation temporarily unavailable.', body: 'We could not reach the confirmation service. Your application has not been affected. Try again later or write to us at ' },
    failures: {
      rate: 'We are receiving many requests right now. Please try again in a few minutes.',
      network: 'Could not send the request. Check your connection and try again.',
      verification: 'We could not validate the request. Please refresh the page and try again.',
      invalid: 'We could not use this link. Enter your application email to request a new one.',
    },
    note: 'Confirming your email is not a decision on your application.',
    other: 'Did not get the email? Request a new link',
    backHome: 'Back to homepage',
    toProgram: 'See the Finer Pioneers programme',
  },
}

/**
 * Lê o token (e o idioma) do fragmento e limpa-o da barra de endereços e do histórico.
 * Lido uma só vez por carregamento da página (o resultado fica em memória): uma segunda
 * leitura — o React repete os efeitos em desenvolvimento — já não encontraria o fragmento.
 */
type Fragment = { token: string; lang: 'en' | null }
let fragmentRead: Fragment | null = null
function readFragment(): Fragment {
  return (fragmentRead ??= parseFragment())
}
function parseFragment(): Fragment {
  if (typeof window === 'undefined') return { token: '', lang: null }
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const token = params.get('t') ?? ''
  const lang = params.get('l') === 'en' ? 'en' : null
  if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search)
  return { token: /^[A-Za-z0-9_-]{43}$/.test(token) ? token : token ? 'invalid' : '', lang }
}

export function PioneersConfirmPage() {
  const { lang, setLang } = useLanguage()
  const t = copy[lang]
  const token = useRef('')
  const [state, setState] = useState<State>('verifying')
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [failure, setFailure] = useState('')
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const preview = devFlags.get('estado') as State | null
    const fragment = readFragment()
    if (fragment.lang) setLang(fragment.lang)
    // Outra ligação aberta no mesmo separador só muda o fragmento: recarrega para a ler de novo.
    const onHash = () => window.location.hash && window.location.reload()
    window.addEventListener('hashchange', onHash)
    const stop = () => window.removeEventListener('hashchange', onHash)
    if (preview && STATES.includes(preview)) setState(preview)
    else if (fragment.token === 'invalid') setState('invalid')
    else {
      token.current = fragment.token
      setState(fragment.token ? 'ready' : 'request')
    }
    return stop
    // Só ao abrir a página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cada mudança de estado é anunciada (o painel recebe o foco).
  useEffect(() => {
    if (state !== 'verifying' && state !== 'ready' && state !== 'request') panel.current?.focus()
  }, [state])

  const confirm = async () => {
    if (!token.current || state === 'verifying') return
    setState('verifying')
    const outcome = await verifyEmail(token.current)
    setState(outcome === 'rate' || outcome === 'network' ? 'error' : outcome)
  }

  const after = (outcome: ResendOutcome) => {
    if (outcome === 'requested') return setState('requested')
    if (outcome === 'unavailable') return setState('unavailable')
    if (outcome === 'invalid') setState('request')
    setFailure(t.failures[outcome])
  }

  const sendNew = async () => {
    if (busy) return
    setBusy(true)
    setFailure('')
    after(await requestConfirmationLink({ token: token.current }))
    setBusy(false)
  }

  const onRequest = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (!isValidEmail(email)) return setEmailError(t.emailError)
    setBusy(true)
    setFailure('')
    after(await requestConfirmationLink({ email }))
    setBusy(false)
  }

  const primary = buttonClasses({ size: 'lg', className: 'group mt-8 h-12 w-full rounded-full bg-[#070D2B] font-semibold shadow-none hover:bg-[#0E1A4D] sm:w-auto sm:min-w-[240px]' })
  const quiet = buttonClasses({ variant: 'outline', size: 'md', className: 'mt-8 rounded-full border-navy/15 bg-white text-navy hover:bg-ice' })
  const mail = (
    <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent-deep underline decoration-accent-deep/30 underline-offset-4">
      {CONTACT_EMAIL}
    </a>
  )
  const alert = failure && (
    <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-[13.5px] text-red-800">
      {failure}
    </p>
  )
  const requestForm = (
    <form noValidate onSubmit={onRequest} className="mt-7 text-left [color-scheme:light]">
      <Field id="conf-email" label={t.email} error={emailError}>
        <TextInput
          className="rounded-full px-5"
          id="conf-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          placeholder={t.emailPh}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setEmailError('')
          }}
          error={emailError}
        />
      </Field>
      {alert}
      <button type="submit" disabled={busy} className={cn(primary, 'mt-6 sm:w-full')}>
        {busy ? t.sending : t.sendNew}
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  )

  return (
    <section className="bg-white pt-[72px] text-navy">
      <div className="mx-auto flex min-h-[calc(100svh-72px)] max-w-[1440px] items-center justify-center px-5 py-16 sm:px-8">
        <div className="relative w-full max-w-[520px]">
          <p className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.24em] text-accent-deep">
            <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
            {t.kicker}
          </p>

          <div ref={panel} tabIndex={-1} role="status" aria-live="polite" className="fo-rise mt-6 overflow-hidden rounded-[28px] border border-[#0B1030]/[0.08] bg-white shadow-[0_40px_80px_-50px_rgba(7,13,43,0.45)] outline-none">
            {/* Linha azul luminosa da marca: acompanha o estado (a meio enquanto falta confirmar, completa quando confirmado). */}
            <div aria-hidden="true" className="h-[3px] bg-[#0B1030]/[0.06]">
              <div
                className={cn(
                  'h-full rounded-full bg-accent shadow-[0_0_14px_rgba(30,144,255,0.9)] transition-[width] duration-700 ease-out',
                  state === 'verified' || state === 'already' ? 'w-full' : state === 'verifying' ? 'w-3/4' : state === 'ready' || state === 'requested' ? 'w-1/2' : 'w-[12%] bg-[#0B1030]/25 shadow-none',
                )}
              />
            </div>

            <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
              {(state === 'ready' || state === 'verifying') && (
                <Panel icon={<MailCheck className="h-7 w-7" aria-hidden="true" />} {...t.ready}>
                  <button type="button" onClick={confirm} disabled={state === 'verifying'} className={primary}>
                    {state === 'verifying' ? t.verifying : t.confirm}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                  <Note>{t.note}</Note>
                </Panel>
              )}

              {(state === 'verified' || state === 'already') && (
                <Panel icon={<CheckCircle2 className="h-7 w-7" aria-hidden="true" />} {...t[state]}>
                  <a href="/" className={quiet}>
                    {t.backHome}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <Note>{t.note}</Note>
                </Panel>
              )}

              {state === 'expired' && (
                <Panel tone="warn" icon={<Clock className="h-7 w-7" aria-hidden="true" />} {...t.expired}>
                  {alert}
                  <button type="button" onClick={sendNew} disabled={busy} className={primary}>
                    {busy ? t.sending : t.sendNew}
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Panel>
              )}

              {state === 'invalid' && (
                <Panel tone="warn" icon={<TriangleAlert className="h-7 w-7" aria-hidden="true" />} {...t.invalid}>
                  {requestForm}
                </Panel>
              )}

              {state === 'error' && (
                <Panel tone="warn" icon={<TriangleAlert className="h-7 w-7" aria-hidden="true" />} {...t.error}>
                  <button type="button" onClick={confirm} className={primary}>
                    {t.retry}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Panel>
              )}

              {state === 'request' && (
                <Panel icon={<MailQuestion className="h-7 w-7" aria-hidden="true" />} {...t.request}>
                  {requestForm}
                </Panel>
              )}

              {state === 'requested' && (
                <Panel icon={<Send className="h-7 w-7" aria-hidden="true" />} {...t.requested}>
                  <Note>
                    {t.limits}
                    {mail}.
                  </Note>
                </Panel>
              )}

              {state === 'unavailable' && (
                <Panel tone="warn" icon={<Info className="h-7 w-7" aria-hidden="true" />} title={t.unavailable.title} body={<>{t.unavailable.body}{mail}.</>}>
                  <a href="/pioneers/" className={quiet}>
                    {t.toProgram}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Panel>
              )}
            </div>
          </div>

          {(state === 'ready' || state === 'error') && (
            <p className="mt-6 text-center text-[13px] text-[#0B1030]/60">
              <button type="button" onClick={() => setState('request')} className="font-semibold text-accent-deep underline decoration-accent-deep/30 underline-offset-4 hover:decoration-accent-deep">
                {t.other}
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function Panel({ icon, title, body, tone = 'ok', children }: { icon: ReactNode; title: string; body: ReactNode; tone?: 'ok' | 'warn'; children?: ReactNode }) {
  return (
    <>
      <span className={cn('mx-auto flex h-14 w-14 items-center justify-center rounded-full', tone === 'ok' ? 'bg-accent/10 text-accent' : 'bg-[#0B1030]/[0.06] text-[#070D2B]')}>{icon}</span>
      <h1 className="mt-5 text-balance font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em] text-[#070D2B] sm:text-[30px]">{title}</h1>
      <p className="mx-auto mt-3 max-w-[400px] text-[15px] leading-[1.6] text-[#0B1030]/70">{body}</p>
      {children}
    </>
  )
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mx-auto mt-7 max-w-[400px] border-t border-[#0B1030]/[0.08] pt-5 text-[12.5px] leading-[1.6] text-[#0B1030]/55">{children}</p>
}
