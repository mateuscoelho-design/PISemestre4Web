import { useEffect, useState } from 'react'
import { API_URL, fetchWithToken, messageFrom, readResponse } from '../services/api'
import iconeHistorico from '../assets/historico-consultas.png'

type AgendamentoApi = {
  idagenda: number
  pacientes_idpacientes: number
  datahora: string
  doutor_iddoutor: number
  servico_idservico: number | null
}

type ConsultaHistorico = {
  id: number
  data: Date
  profissional: string
  servico: string
}

// Botão reutilizado na lista de pacientes e nos detalhes do agendamento.
export function PatientHistoryButton({
  patientName,
  onClick,
}: {
  patientName: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={`Ver histórico de consultas de ${patientName}`}
      className="group flex h-9 w-9 items-center justify-center rounded-md text-[#3f5c4f] transition hover:bg-[#3f5c4f] hover:text-white"
      onClick={onClick}
      title="Histórico de consultas"
      type="button"
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-[18px] w-[18px] object-contain [filter:brightness(0)_saturate(100%)_invert(35%)_sepia(12%)_saturate(556%)_hue-rotate(98deg)_brightness(90%)_contrast(88%)] group-hover:[filter:brightness(0)_invert(1)]"
        src={iconeHistorico}
      />
    </button>
  )
}

// Exibe os agendamentos anteriores e futuros de um único paciente.
export function PatientHistoryModal({
  patient,
  onClose,
}: {
  patient: { id: number; nome: string }
  onClose: () => void
}) {
  const [consultas, setConsultas] = useState<ConsultaHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [agora] = useState(() => Date.now())

  useEffect(() => {
    let active = true

    async function carregarHistorico() {
      try {
        const [agendaResponse, doutoresResponse, servicosResponse] = await Promise.all([
          fetchWithToken(`${API_URL}/agenda`),
          fetchWithToken(`${API_URL}/doutores/listarByCNPJ`),
          fetchWithToken(`${API_URL}/servicos`),
        ])

        const agendaData = await readResponse(agendaResponse) as {
          agendamentos?: AgendamentoApi[]
          message?: string
        }
        if (!agendaResponse.ok) throw new Error(messageFrom(agendaData))
        if (!Array.isArray(agendaData.agendamentos)) {
          throw new Error('A API retornou uma lista de agendamentos inválida.')
        }

        const doutoresData: { doutores?: { iddoutor: number; nome: string }[] } = doutoresResponse.ok
          ? await readResponse(doutoresResponse)
          : {}
        const servicosData: { servicos?: { idservico: number; nome: string }[] } = servicosResponse.ok
          ? await readResponse(servicosResponse)
          : {}
        const nomesDoutores = new Map(
          (doutoresData.doutores ?? []).map((doutor) => [doutor.iddoutor, doutor.nome]),
        )
        const nomesServicos = new Map(
          (servicosData.servicos ?? []).map((servico) => [servico.idservico, servico.nome]),
        )

        const historico = agendaData.agendamentos
          .filter((agendamento) => Number(agendamento.pacientes_idpacientes) === patient.id)
          .map((agendamento) => ({
            id: agendamento.idagenda,
            data: new Date(agendamento.datahora),
            profissional: nomesDoutores.get(agendamento.doutor_iddoutor)
              ?? `Profissional #${agendamento.doutor_iddoutor}`,
            servico: agendamento.servico_idservico == null
              ? 'Serviço não informado'
              : nomesServicos.get(agendamento.servico_idservico)
                ?? `Serviço #${agendamento.servico_idservico}`,
          }))

        if (historico.some((consulta) => Number.isNaN(consulta.data.getTime()))) {
          throw new Error('A API retornou uma data inválida para um agendamento.')
        }

        if (active) setConsultas(historico)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o histórico.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void carregarHistorico()
    return () => {
      active = false
    }
  }, [patient.id])

  const futuras = consultas
    .filter((consulta) => consulta.data.getTime() >= agora)
    .sort((a, b) => a.data.getTime() - b.data.getTime())
  const anteriores = consultas
    .filter((consulta) => consulta.data.getTime() < agora)
    .sort((a, b) => b.data.getTime() - a.data.getTime())

  function renderConsultas(lista: ConsultaHistorico[], mensagemVazia: string) {
    if (!lista.length) {
      return <p className="rounded-lg bg-[#f6f8f6] px-4 py-3 text-sm text-gray-500">{mensagemVazia}</p>
    }

    return (
      <ul className="space-y-2">
        {lista.map((consulta) => (
          <li className="rounded-lg border border-[#e2e9e4] bg-[#f6f8f6] px-4 py-3" key={consulta.id}>
            <p className="font-semibold text-[#3f5c4f]">
              {consulta.data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
            <p className="mt-1 text-sm text-gray-800">{consulta.servico}</p>
            <p className="text-sm text-gray-600">Profissional: {consulta.profissional}</p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="historico-consultas-titulo"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
      >
        <h2 id="historico-consultas-titulo" className="text-xl font-bold text-[#4f7161]">
          Histórico de Consultas
        </h2>
        <p className="mb-5 mt-1 text-sm text-gray-600">Paciente: {patient.nome}</p>

        {loading ? (
          <p className="py-6 text-center text-gray-600">Carregando histórico...</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 font-semibold text-gray-800">Próximas consultas ({futuras.length})</h3>
              {renderConsultas(futuras, 'Nenhuma consulta futura agendada.')}
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-800">Consultas anteriores ({anteriores.length})</h3>
              {renderConsultas(anteriores, 'Nenhuma consulta anterior encontrada.')}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-lg bg-[#4f7161] px-4 py-2 font-semibold text-white transition hover:bg-[#3f5c4f]"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  )
}