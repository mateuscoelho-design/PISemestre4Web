import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Assets } from '../AssetsClass'
import { API_URL } from '../../services/api'
import { PatientAnamneseModal } from '../PatientAnamneseModal'
import { PatientHistoryButton, PatientHistoryModal } from '../PatientHistoryModal'
import NovaConsultaModal from './NovaConsultaModal'

type DetalhesConsultaModalProps = {
  consulta: {
    id: string
    pacienteId: number
    doutorId: number
    servicoId: number | null
    pacienteNome: string
    pacienteTelefone?: string
    pacienteEmail?: string
    doutorNome: string
    servicoNome: string
    servicoPreco?: number
    inicio: Date
    status?: string
  }
  aoFechar: () => void
  aoExcluir: () => void
  aoAtualizar: (dataHora: string) => void
}

export default function DetalhesConsultaModal({ consulta, aoFechar, aoExcluir, aoAtualizar }: DetalhesConsultaModalProps) {
  const [editando, setEditando] = useState(false)
  const [anamneseAberta, setAnamneseAberta] = useState(false)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [erro, setErro] = useState('')
  const { token } = useAuth()
  const telefone = consulta.pacienteTelefone?.replace(/\D/g, '')
  const telefoneWhatsApp = telefone
    ? telefone.startsWith('55') ? telefone : `55${telefone}`
    : ''
  const telefoneValido = /^\d{12,13}$/.test(telefoneWhatsApp)
  const mensagemWhatsApp = `Olá, ${consulta.pacienteNome}! Gostaria de confirmar seu agendamento para ${consulta.inicio.toLocaleString('pt-BR')}, com o(a) ${consulta.doutorNome}. Está tudo certo?`
  const linkWhatsApp = telefoneValido
    ? `https://wa.me/${telefoneWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}`
    : null
  const emailPaciente = consulta.pacienteEmail?.trim() ?? ''
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPaciente)
  const linkEmail = emailValido
    ? `mailto:${encodeURIComponent(emailPaciente)}?subject=${encodeURIComponent('Confirmação de agendamento')}&body=${encodeURIComponent(mensagemWhatsApp)}`
    : null

  async function apagarAgendamento() {
    setApagando(true)
    setErro('')
    try {
      const response = await fetch(`${API_URL}/agenda/delete/${consulta.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Não foi possível apagar o agendamento.')
      aoExcluir()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível apagar o agendamento.')
    } finally {
      setApagando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) aoFechar()
      }}
    >
      <section
        aria-labelledby="detalhes-consulta-titulo"
        aria-modal="true"
        className="w-full max-w-md rounded-[10px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)] md:p-8"
        role="dialog"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 id="detalhes-consulta-titulo" className="text-xl font-bold text-[#4f7161]">
            Detalhes da Consulta
          </h2>
          <button
            className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-[#3f5c4f] transition hover:bg-[#edf4ef]"
            disabled={apagando}
            onClick={() => setEditando(true)}
            title="Editar agendamento"
            type="button"
          >
            ✎ Editar
          </button>
        </div>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-gray-500">Paciente</dt>
            <dd className="flex items-center gap-2 font-semibold text-gray-800">
              <span>{consulta.pacienteNome}</span>
              <button
                aria-label={`Abrir anamnese de ${consulta.pacienteNome}`}
                className="rounded-md px-2 py-1 text-xl font-bold text-[#3f5c4f] transition hover:bg-[#3f5c4f] hover:text-white"
                onClick={() => setAnamneseAberta(true)}
                title="Abrir anamnese"
                type="button"
              >
                🗒
              </button>
              <PatientHistoryButton
                patientName={consulta.pacienteNome}
                onClick={() => setHistoricoAberto(true)}
              />
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Doutor(a)</dt>
            <dd className="font-semibold text-gray-800">{consulta.doutorNome}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Serviço</dt>
            <dd className="font-semibold text-gray-800">
              {consulta.servicoNome}
              {consulta.servicoPreco !== undefined && ` — R$ ${consulta.servicoPreco.toFixed(2)}`}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Data e hora</dt>
            <dd className="font-semibold text-gray-800">{consulta.inicio.toLocaleString('pt-BR')}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className="font-semibold text-gray-800">{consulta.status || 'Não informado'}</dd>
          </div>
        </dl>
        {confirmando && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <p>Tem certeza que deseja apagar este agendamento? Esta ação não pode ser desfeita.</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
                disabled={apagando}
                type="button"
                onClick={() => setConfirmando(false)}
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                disabled={apagando}
                type="button"
                onClick={apagarAgendamento}
              >
                {apagando ? 'Apagando...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        )}
        {erro && <p className="mt-4 text-sm text-red-700" role="alert">{erro}</p>}
        <div className="mt-7 flex justify-between gap-3">
          <button
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            disabled={apagando}
            type="button"
            onClick={() => {
              setErro('')
              setConfirmando(true)
            }}
          >
            Apagar agendamento
          </button>
          <div className="flex gap-2">
            {linkWhatsApp ? (
              <a
                aria-label="Enviar confirmação pelo WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366] text-sm font-bold text-white transition hover:bg-[#1fb957]"
                href={linkWhatsApp}
                rel="noopener noreferrer"
                target="_blank"
                title="Enviar confirmação pelo WhatsApp"
              >
                <img
                  className="h-5 w-5"
                  src={Assets.Imagens.whatsapp}
                  alt="Pacientes e profissional em uma clínica"
                />
              </a>
            ) : (
              <button
                aria-label="WhatsApp indisponível: verifique o telefone do paciente"
                className="h-10 w-10 cursor-not-allowed rounded-lg bg-gray-300 text-sm font-bold text-white"
                disabled
                title={!telefone
                  ? 'Cadastre o telefone do paciente para usar o WhatsApp'
                  : 'O telefone do paciente não é válido para o WhatsApp'}
                type="button"
              >
                <img
                  className="h-5 w-5"
                  src={Assets.Imagens.whatsapp}
                  alt="Pacientes e profissional em uma clínica"
                />
              </button>
            )}
            {linkEmail ? (
              <a
                aria-label="Enviar confirmação por e-mail"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ab183a] text-sm font-bold text-white transition hover:bg-[#701026]"
                href={linkEmail}
                title="Enviar confirmação por e-mail"
              >
                <img
                  className="h-5 w-5"
                  src={Assets.Imagens.email}
                  alt="Pacientes e profissional em uma clínica"
                />
              </a>
            ) : (
              <button
                aria-label="E-mail indisponível: verifique o e-mail do paciente"
                className="h-10 w-10 cursor-not-allowed rounded-lg bg-gray-300 text-sm font-bold text-white"
                disabled
                title="Cadastre um e-mail válido para o paciente"
                type="button"
              >
                <img
                  className="h-5 w-5"
                  src={Assets.Imagens.email}
                  alt="Pacientes e profissional em uma clínica"
                />
              </button>
            )}
            <button
              className="rounded-lg bg-[#4f7161] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f5c4f]"
              disabled={apagando}
              type="button"
              onClick={aoFechar}
            >
              Fechar
            </button>
          </div>
        </div>
      </section>
      {editando && (
        <NovaConsultaModal
          consultaEditar={consulta}
          aoFechar={() => setEditando(false)}
          aoSalvar={(dataHora) => {
            setEditando(false)
            aoAtualizar(dataHora)
          }}
        />
      )}
      {historicoAberto && (
        <PatientHistoryModal
          patient={{ id: consulta.pacienteId, nome: consulta.pacienteNome }}
          onClose={() => setHistoricoAberto(false)}
        />
      )}
      {anamneseAberta && (
        <PatientAnamneseModal
          patient={{ idpacientes: consulta.pacienteId, nome: consulta.pacienteNome }}
          onClose={() => setAnamneseAberta(false)}
          onSaved={() => setAnamneseAberta(false)}
        />
      )}
    </div>
  )
}