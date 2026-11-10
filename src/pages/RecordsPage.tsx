import { useEffect, useState } from 'react'
import type { Page, RecordItem } from '../types'
import { API_URL, fetchWithToken, readResponse, messageFrom, post } from '../services/api'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { ListActions } from '../components/common/ListActions'
import { PatientAnamneseModal } from '../components/PatientAnamneseModal'
import { PatientHistoryModal } from '../components/PatientHistoryModal'

export function RecordsPage({
  kind,
  onNavigate,
  onEdit,
}: {
  kind: 'pacientes' | 'profissionais'
  onNavigate: (page: Page) => void
  onEdit: (item: RecordItem) => void
}) {
  const [items, setItems] = useState<RecordItem[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState(false)
  const [anamnesePatient, setAnamnesePatient] = useState<RecordItem | null>(null)
  const [historicoPatient, setHistoricoPatient] = useState<RecordItem | null>(null)
  const [notice, setNotice] = useState('')
  const isPatients = kind === 'pacientes'

  // useEffect executa o carregamento quando a página é montada ou quando kind muda.
  useEffect(() => {
    fetchWithToken(
      `${API_URL}/${isPatients ? 'pacientes' : 'doutores'}/listarByCNPJ`,
    )
      .then(async (response) => {
        const data = await readResponse(response)
        if (!response.ok) throw new Error()
        setItems(data[isPatients ? 'pacientes' : 'doutores'] || [])
      })
      .catch(() => setError(true))
  }, [isPatients])

  const filtered = items.filter((item) =>
    item.nome?.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const deleteItem = async (item: RecordItem) => {
    const id = isPatients ? item.idpaciente ?? item.idpacientes : item.iddoutor
    if (!id || !window.confirm(`Deseja excluir ${item.nome}?`)) return
    try {
      const response = await post(`/${isPatients ? 'pacientes' : 'doutores'}/delete/${id}`, {})
      if (!response.ok) throw new Error(messageFrom(response.data))
      setItems((current) => current.filter((currentItem) => currentItem !== item))
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir o registro.')
    }
  }

  const beginAnamnese = (item: RecordItem) => {
    if (!item.idpaciente && !item.idpacientes) {
      window.alert('Não foi possível identificar o paciente.')
      return
    }
    setNotice('')
    setAnamnesePatient(item)
  }

  const beginHistorico = (item: RecordItem) => {
    if (!item.idpaciente && !item.idpacientes) {
      window.alert('Não foi possível identificar o paciente.')
      return
    }
    setHistoricoPatient(item)
  }

  return (
    <Sidebar active={kind} onNavigate={onNavigate}>
      {notice && (
        <p className="mb-4 rounded-lg bg-[#eef4ef] px-4 py-3 text-[#3f5c4f]" role="status">
          {notice}
        </p>
      )}
      <div className="mb-6 flex items-center gap-4">
        <input
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#4f7161] focus:outline-none focus:ring-2 focus:ring-[#4f7161]/20"
          placeholder={`Pesquisar ${isPatients ? 'paciente' : 'profissional'}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          className="h-11 w-11 shrink-0 rounded-lg bg-[#4f7161] text-2xl leading-none text-white transition hover:bg-[#3f5c4f]"
          type="button"
          onClick={() =>
            onNavigate(isPatients ? 'cadastroPaciente' : 'cadastroProfissional')
          }
        >
          +
        </button>
      </div>
      <div className="rounded-[10px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <ul className="max-h-[65vh] list-none overflow-y-auto">
          {error ? (
            <li className="rounded-lg bg-[#eef4ef] px-4 py-3.5 text-center text-gray-500">Não foi possível carregar os dados.</li>
          ) : filtered.length ? (
            filtered.map((item) => (
              <li className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#eef4ef] px-4 py-3.5 text-gray-800 last:mb-0" key={item.idpaciente || item.idpacientes || item.iddoutor || item.nome}>
                <span className="font-bold">
                  {isPatients ? item.idpaciente ?? item.idpacientes : item.iddoutor} — {isPatients ? item.nome : `${item.nome} - ${item.especialidade}`}
                </span>
                <ListActions
                  onEdit={() => onEdit(item)}
                  onDelete={() => deleteItem(item)}
                  onAddAnamnese={isPatients ? () => beginAnamnese(item) : undefined}
                  onViewHistory={isPatients ? () => beginHistorico(item) : undefined}
                  patientName={isPatients ? item.nome : undefined}
                />
              </li>
            ))
          ) : (
            <li className="rounded-lg bg-[#eef4ef] px-4 py-3.5 text-center text-gray-500">
              {items.length
                ? 'Nenhum resultado encontrado.'
                : `Nenhum ${isPatients ? 'paciente' : 'profissional'} cadastrado ainda.`}
            </li>
          )}
        </ul>
      </div>
      {historicoPatient && (
        <PatientHistoryModal
          patient={{
            id: historicoPatient.idpaciente ?? historicoPatient.idpacientes!,
            nome: historicoPatient.nome,
          }}
          onClose={() => setHistoricoPatient(null)}
        />
      )}
      {anamnesePatient && (
        <PatientAnamneseModal
          patient={anamnesePatient}
          onClose={() => setAnamnesePatient(null)}
          onSaved={(wasUpdated) => {
            setAnamnesePatient(null)
            setNotice(
              wasUpdated
                ? 'Anamnese atualizada com sucesso.'
                : 'Anamnese cadastrada com sucesso.',
            )
          }}
        />
      )}
    </Sidebar>
  )
}