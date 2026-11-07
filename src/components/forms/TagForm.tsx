import type { FormProps, TagItem } from '../../types'
import { EntityForm } from './EntityForm'

export function TagForm({
  onNavigate, onNotice, notice, item, embedded, onSaved, onCancel,
}: FormProps & {
  item?: TagItem
  embedded?: boolean
  onSaved?: (values: Record<string, string>) => void
  onCancel?: () => void
}) {
  return (
    <EntityForm
      title={item ? 'Editar Tag' : 'Cadastrar Tag'}
      back="tags"
      endpoint={item ? `/tag/update/${item.idtag}` : '/tag/register'}
      onNavigate={onNavigate}
      onNotice={onNotice}
      notice={notice}
      embedded={embedded}
      onSaved={onSaved}
      onCancel={onCancel}
      initialValues={item}
      submitLabel={item ? 'Salvar alterações' : 'Cadastrar'}
      fields={[{ label: 'Nome da Tag', name: 'descricao' }]}
    />
  )
}