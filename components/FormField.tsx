'use client'

/**
 * Campo de formulário com label e mensagem de erro.
 * Preparado para validação: passar error para exibir abaixo do input e invalid para destacar o input.
 */
type FormFieldProps = {
  label: string
  name?: string
  error?: string | null
  hint?: string
  invalid?: boolean
  children: React.ReactNode
  className?: string
}

export default function FormField({
  label,
  name,
  error,
  hint,
  invalid,
  children,
  className = '',
}: FormFieldProps) {
  const errorId = name ? `${name}-error` : undefined
  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  )
}
