import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Page, EntityFieldConfig } from '../../types'
import { post, messageFrom, downloadDocumentPdf } from '../../services/api'
import { Sidebar } from '../Sidebar/Sidebar'
import { EntityField } from '../common/EntityField'

export function EntityForm({
  title,
  back,
  active,
  fields,
  endpoint,
  downloadPdf = false,
  onNavigate,
  onNotice,
  notice,
  initialValues,
  submitLabel = 'Cadastrar',
  embedded = false,
  onSaved,
  onCancel,
  fieldActions,
}: {
  title: string
  back: Page
  active?: Page
  fields: EntityFieldConfig[]
  endpoint: string
  downloadPdf?: boolean
  onNavigate: (page: Page) => void
  onNotice: (notice: string) => void
  notice: string
  initialValues?: Record<string, string | number | boolean | number[] | undefined>
  submitLabel?: string
  embedded?: boolean
  onSaved?: (values: Record<string, string>) => void
  onCancel?: () => void
  fieldActions?: Record<string, { label: string; onClick: () => void }>
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, String(initialValues?.[field.name] ?? '')])),
  )

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (fields.some((field) => !field.optional && field.type !== 'multiselect' && !values[field.name]))
      return onNotice('Por favor, preencha todos os campos obrigatórios!')

    if ('valordesconto' in values) {
      const desconto = Number(values.valordesconto.replace(',', '.'))
      if (!Number.isFinite(desconto) || desconto < 0 || desconto > 100)
        return onNotice('Informe um desconto válido entre 0 e 100%.')
    }

    const payload = Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.type === 'multiselect'
          ? values[field.name].split(',').filter(Boolean).map(Number)
          : field.type === 'radio'
            ? values[field.name] === 'true' ? 1 : 0
            : field.type === 'number' || field.type === 'select'
              ? Number(field.name === 'valordesconto'
                ? values[field.name].replace(',', '.')
                : values[field.name])
              : values[field.name],
      ]),
    )

    try {
      if (downloadPdf) {
        await downloadDocumentPdf(endpoint, payload)
        onNotice('PDF gerado e baixado com sucesso!')
      } else {
        const response = await post(endpoint, payload)
        if (!response.ok) throw new Error(messageFrom(response.data))
        onNotice('Cadastro realizado com sucesso!')
      }

      if (onSaved) {
        onSaved(values)
      } else {
        onNavigate(back)
      }
    } catch (error) {
      onNotice(
        error instanceof Error ? error.message : 'Erro ao realizar cadastro.',
      )
    }
  }

  const content = (
    <div className="mx-auto max-w-2xl rounded-[10px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.1)] md:p-8">
      <h1 className="mb-7 text-2xl font-bold text-[#4f7161]">{title}</h1>
      {notice && <p className="notice">{notice}</p>}
      <form onSubmit={submit}>
        {fields.map((field) => (
          <div key={field.name} className="relative">
            {fieldActions?.[field.name] && (
              <button
                className="absolute right-0 top-0 cursor-pointer text-sm font-medium text-[#4f7161] hover:underline"
                type="button"
                onClick={fieldActions[field.name].onClick}
              >
                + {fieldActions[field.name].label}
              </button>
            )}
            <EntityField
              field={field}
              value={values[field.name]}
              onChange={(value) =>
                setValues((current) => ({ ...current, [field.name]: value }))
              }
            />
          </div>
        ))}
        <button className='cadastrar' type="submit">{submitLabel}</button>
      </form>
      <div className="mt-5 text-center">
        {embedded ? (
          <button
            type="button"
            className="font-bold text-[#4f7161] hover:underline cursor-pointer"
            onClick={onCancel}
          >
            Cancelar
          </button>
        ) : (
          <p>
            <a className="font-bold text-[#4f7161] hover:underline" href={`#${back}`} onClick={() => onNavigate(back)}>
              Voltar
            </a>
          </p>
        )}
      </div>
    </div>
  )

  return embedded ? content : (
    <Sidebar active={active ?? back} onNavigate={onNavigate}>
      {content}
    </Sidebar>
  )
}