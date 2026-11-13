import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23070D2B' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")"

const control =
  'w-full rounded-xl border bg-white px-4 text-[15px] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-navy/50 focus:border-accent focus:shadow-[0_0_0_4px_rgba(0,82,255,0.15)]'

type FieldProps = { id: string; label: string; hint?: string; error?: string; optional?: string; children: ReactNode }

/** Rótulo, ajuda e erro ligados ao controlo (aria-describedby). */
export function Field({ id, label, hint, error, optional, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[13.5px] font-semibold text-navy">
        {label}
        {optional && <span className="text-[12px] font-normal text-navy/70">{optional}</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[12.5px] text-navy/70">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-red-700">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, hint?: boolean, error?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
}

export function TextInput({ id, error, hasHint, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string; hasHint?: boolean }) {
  return (
    <input
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hasHint, error)}
      className={cn(control, 'h-12', error ? 'border-red-600' : 'border-navy/20', className)}
      {...props}
    />
  )
}

export function TextArea({ id, error, hasHint, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string; hasHint?: boolean }) {
  return (
    <textarea
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hasHint, error)}
      className={cn(control, 'min-h-[120px] resize-y py-3 leading-relaxed', error ? 'border-red-600' : 'border-navy/20', className)}
      {...props}
    />
  )
}

export function SelectInput({ id, error, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { id: string; error?: string }) {
  return (
    <select
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, false, error)}
      className={cn(control, 'h-12 appearance-none pr-10', error ? 'border-red-600' : 'border-navy/20', className)}
      style={{ backgroundImage: CHEVRON, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
      {...props}
    >
      {children}
    </select>
  )
}

export function ConsentCheckbox({ id, checked, onChange, error, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-[13.5px] leading-snug text-navy/85">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#0052FF]"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 pl-[30px] text-[12.5px] font-medium text-red-700">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Campo-armadilha: invisível para pessoas e leitores de ecrã, mas presente no
 * HTML. Robôs que preenchem todos os campos denunciam-se aqui.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
