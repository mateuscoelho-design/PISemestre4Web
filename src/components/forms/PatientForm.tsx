import { useEffect, useState } from 'react'
import type { FormProps, RecordItem, SelectOption } from '../../types'
import { API_URL, fetchWithToken, readResponse, messageFrom } from '../../services/api'
import { EntityForm } from './EntityForm'
import { TagForm } from './TagForm'
import { PlanoForm } from './PlanoForm'

export function PatientForm({
  onNavigate, onNotice, notice, item, embedded, onSaved, onCancel,
}: FormProps & {
  item?: RecordItem
  embedded?: boolean
  onSaved?: (values: Record<string, string>) => void
  onCancel?: () => void
}) {
  const [tags, setTags] = useState<SelectOption[]>([])
  const [planos, setPlanos] = useState<SelectOption[]>([])
  const [cadastroAberto, setCadastroAberto] = useState<'tag' | 'plano' | null>(null)
  const [avisoCadastro, setAvisoCadastro] = useState('')

  useEffect(() => {
    Promise.all([
      fetchWithToken(`${API_URL}/tag/listarByCNPJ`),
      fetchWithToken(`${API_URL}/plano/listarByCNPJ`),
    ])
      .then(async ([tagsResponse, planosResponse]) => {
        const tagsData = await readResponse(tagsResponse)
        const planosData = await readResponse(planosResponse)
        if (!tagsResponse.ok) throw new Error(messageFrom(tagsData))
        if (!planosResponse.ok) throw new Error(messageFrom(planosData))
        setTags(
          (tagsData.tags || []).map(
            (tag: { idtag: number; descricao: string }) => ({
              label: tag.descricao,
              value: String(tag.idtag),
            }),
          ),
        )
        setPlanos(
          (planosData.planos || []).map(
            (plano: { idplano: number; descricao: string }) => ({
              label: plano.descricao,
              value: String(plano.idplano),
            }),
          ),
        )
      })
      .catch((error) => {
        onNotice(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar tags e planos.',
        )
      })
  }, [onNotice])

  async function handleCadastroConcluido(tipo: 'tag' | 'plano') {
    try {
      const caminho = tipo === 'tag' ? '/tag/listarByCNPJ' : '/plano/listarByCNPJ'
      const response = await fetchWithToken(`${API_URL}${caminho}`)
      const data = await readResponse(response)
      if (!response.ok) throw new Error(messageFrom(data))

      if (tipo === 'tag') {
        setTags((data.tags || []).map((tag: { idtag: number; descricao: string }) => ({
          label: tag.descricao,
          value: String(tag.idtag),
        })))
      } else {
        setPlanos((data.planos || []).map((plano: { idplano: number; descricao: string }) => ({
          label: plano.descricao,
          value: String(plano.idplano),
        })))
      }
    } catch (error) {
      onNotice(error instanceof Error
        ? `Cadastro realizado, mas não foi possível atualizar a lista: ${error.message}`
        : 'Cadastro realizado, mas não foi possível atualizar a lista.')
    } finally {
      setCadastroAberto(null)
    }
  }

  return (
    <>
      <EntityForm
        title={item ? 'Editar Paciente' : 'Cadastrar Paciente'}
        back="pacientes"
        endpoint={item ? `/pacientes/update/${item.idpaciente ?? item.idpacientes}` : '/pacientes/register'}
        onNavigate={onNavigate}
        onNotice={onNotice}
        notice={notice}
        embedded={embedded}
        onSaved={onSaved}
        onCancel={onCancel}
        fieldActions={{
          tag_ids: {
            label: 'Cadastrar nova tag',
            onClick: () => { setAvisoCadastro(''); setCadastroAberto('tag') },
          },
          plano_idplano: {
            label: 'Cadastrar novo plano',
            onClick: () => { setAvisoCadastro(''); setCadastroAberto('plano') },
          },
        }}
        initialValues={item}
        submitLabel={item ? 'Salvar alterações' : 'Cadastrar'}
        fields={[
          { label: 'Nome', name: 'nome' },
          { label: 'CPF', name: 'cpf' },
          { label: 'Telefone', name: 'telefone' },
          { label: 'E-mail', name: 'email', type: 'email' },
          { label: 'Complemento', name: 'complemento', type: 'textarea' },
          { label: 'Tags', name: 'tag_ids', type: 'multiselect', options: tags },
          {
            label: 'Plano',
            name: 'plano_idplano',
            type: 'select',
            options: [
              { label: 'Selecione um plano', value: '' },
              ...planos,
            ],
          },
        ]}
      />
      {cadastroAberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[10px]" role="dialog" aria-modal="true">
            {cadastroAberto === 'tag' ? (
              <TagForm
                onNavigate={onNavigate}
                onNotice={setAvisoCadastro}
                notice={avisoCadastro}
                embedded
                onCancel={() => setCadastroAberto(null)}
                onSaved={() => { void handleCadastroConcluido('tag') }}
              />
            ) : (
              <PlanoForm
                onNavigate={onNavigate}
                onNotice={setAvisoCadastro}
                notice={avisoCadastro}
                embedded
                onCancel={() => setCadastroAberto(null)}
                onSaved={() => { void handleCadastroConcluido('plano') }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}