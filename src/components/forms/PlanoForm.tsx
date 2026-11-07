import type { FormProps, PlanoItem } from '../../types'
import { EntityForm } from './EntityForm'

// Formulario
export function PlanoForm({
  onNavigate, onNotice, notice, item, embedded, onSaved, onCancel,
}: FormProps & {
  item?: PlanoItem
  embedded?: boolean
  onSaved?: (values: Record<string, string>) => void
  onCancel?: () => void
}) {
  return (
    <EntityForm
      title={item ? 'Editar Plano' : 'Cadastrar Plano'}
      back="planos"
      endpoint={item ? `/plano/update/${item.idplano}` : '/plano/register'}
      onNavigate={onNavigate}
      onNotice={onNotice}
      notice={notice}
      embedded={embedded}
      onSaved={onSaved}
      onCancel={onCancel}
      initialValues={item ? {
        ...item,
        aplicadesconto: Number(item.aplicadesconto) === 1,
        exonera: Number(item.exonera) === 1,
      } : undefined}
      submitLabel={item ? 'Salvar alterações' : 'Cadastrar'}
      fields={[
        { label: 'Nome', name: 'descricao' },
        // os radios são obrigatórios, se não marcar Sim/Não o form não envia
        {
          label: 'Desconta',
          name: 'aplicadesconto',
          type: 'radio',
          options: [
            { label: 'Sim', value: 'true' },
            { label: 'Não', value: 'false' },
          ],
        },
        { label: 'Valor do desconto (%)', name: 'valordesconto', type: 'number' },
        {
          label: 'Exonera',
          name: 'exonera',
          type: 'radio',
          options: [
            { label: 'Sim', value: 'true' },
            { label: 'Não', value: 'false' },
          ],
        },
      ]}
    />
  )
}