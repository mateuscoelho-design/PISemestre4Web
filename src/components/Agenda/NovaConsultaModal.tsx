// frontend/react-agenda/src/NovaConsultaModal.jsx

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PatientForm } from '../forms/PatientForm'
import { ProfessionalForm } from '../forms/ProfessionalForm'
import { ServicoForm } from '../forms/ServicoForm'
import { API_URL } from '../../services/api'

export type ConsultaParaEdicao = {
  id: string
  pacienteId: number
  doutorId: number
  servicoId: number | null
  inicio: Date
}

type NovaConsultaModalProps = {
  aoFechar: () => void
  aoSalvar: (dataHora: string) => void
  consultaEditar?: ConsultaParaEdicao
}

// Converte a data para o formato local aceito pelo campo datetime-local.
function dataHoraParaInput(data: Date) {
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`
}

type PessoaOption = {
  idpacientes?: number
  iddoutor?: number
  cpf?: string
  documento?: string
  nome: string
}

type ServicoOption = {
  idservico: number
  nome: string
  preco: number
}

export default function NovaConsultaModal({ aoFechar, aoSalvar, consultaEditar }: NovaConsultaModalProps) {
  const [pacienteId, setPacienteId] = useState(consultaEditar ? String(consultaEditar.pacienteId) : '')
  const [doutorId, setDoutorId] = useState(consultaEditar ? String(consultaEditar.doutorId) : '')
  const [servicoId, setServicoId] = useState(consultaEditar?.servicoId != null ? String(consultaEditar.servicoId) : '')
  const [dataHora, setDataHora] = useState(consultaEditar ? dataHoraParaInput(consultaEditar.inicio) : '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [pacientes, setPacientes] = useState<PessoaOption[]>([])
  const [doutores, setDoutores] = useState<PessoaOption[]>([])
  const [servicos, setServicos] = useState<ServicoOption[]>([])
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true)
  const [cadastroAberto, setCadastroAberto] = useState<'paciente' | 'profissional' | 'servico' | null>(null)
  const [avisoCadastro, setAvisoCadastro] = useState('')
  const { token, user } = useAuth()

  useEffect(() => {
    async function carregarPessoas() {
      try {
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {}
        const [pacientesResponse, doutoresResponse, servicosResponse] = await Promise.all([
          fetch(`${API_URL}/pacientes/listarByCNPJ`, { headers }),
          fetch(`${API_URL}/doutores/listarByCNPJ`, { headers }),
          fetch(`${API_URL}/servicos`, { headers }),
        ])
        const pacientesData = await pacientesResponse.json()
        const doutoresData = await doutoresResponse.json()
        const servicosData = await servicosResponse.json()
        if (!pacientesResponse.ok || !doutoresResponse.ok || !servicosResponse.ok) {
          throw new Error(pacientesData.message || doutoresData.message || servicosData.message || 'Não foi possível carregar pacientes, profissionais e serviços.')
        }
        setPacientes(pacientesData.pacientes ?? [])
        setDoutores(doutoresData.doutores ?? [])
        setServicos(servicosData.servicos ?? [])
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Não foi possível carregar pacientes, profissionais e serviços.')
      } finally {
        setCarregandoOpcoes(false)
      }
    }

    carregarPessoas()
  }, [token])

  async function handleCadastroConcluido(tipo: 'paciente' | 'profissional' | 'servico', values: Record<string, string>) {
    setCadastroAberto(null)
    setCarregandoOpcoes(true)
    setErro('')
    try {
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {}
      const caminho = tipo === 'paciente' ? '/pacientes/listarByCNPJ' : tipo === 'profissional' ? '/doutores/listarByCNPJ' : '/servicos'
      const resposta = await fetch(`${API_URL}${caminho}`, { headers })
      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados.message || 'Não foi possível atualizar a lista.')

      if (tipo === 'servico') {
        const lista: ServicoOption[] = dados.servicos ?? []
        const idsAnteriores = new Set(servicos.map((servico) => servico.idservico))
        setServicos(lista)
        const novo = lista.find((servico) =>
          !idsAnteriores.has(servico.idservico) &&
          servico.nome.trim().toLowerCase() === values.nome.trim().toLowerCase() &&
          Number(servico.preco) === Number(values.preco)
        )
        if (novo) setServicoId(String(novo.idservico))
        else setErro('Serviço cadastrado, mas não foi possível selecioná-lo automaticamente. Selecione-o na lista.')
      } else if (tipo === 'paciente') {
        const lista: PessoaOption[] = dados.pacientes ?? []
        setPacientes(lista)
        const cpf = values.cpf.replace(/\D/g, '')
        const novo = lista
          .filter((pessoa) => pessoa.cpf?.replace(/\D/g, '') === cpf)
          .sort((a, b) => (b.idpacientes ?? 0) - (a.idpacientes ?? 0))[0]
        if (novo?.idpacientes) setPacienteId(String(novo.idpacientes))
        else setErro('Paciente cadastrado, mas não foi possível selecioná-lo automaticamente. Selecione-o na busca.')
      } else {
        const lista: PessoaOption[] = dados.doutores ?? []
        setDoutores(lista)
        const documento = values.documento.trim().toLowerCase()
        const novo = lista
          .filter((pessoa) => pessoa.documento?.trim().toLowerCase() === documento)
          .sort((a, b) => (b.iddoutor ?? 0) - (a.iddoutor ?? 0))[0]
        if (novo?.iddoutor) setDoutorId(String(novo.iddoutor))
        else setErro('Profissional cadastrado, mas não foi possível selecioná-lo automaticamente. Selecione-o na busca.')
      }
    } catch (error) {
      setErro(error instanceof Error
        ? `Cadastro realizado, mas não foi possível atualizar a lista: ${error.message}`
        : 'Cadastro realizado, mas não foi possível atualizar a lista.')
    } finally {
      setCarregandoOpcoes(false)
    }
  }

  async function handleSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    if (!pacienteId || !doutorId || !servicoId) {
      setErro('Selecione um paciente, um profissional e um serviço.')
      return
    }

    if (!user?.clinica_cnpj) {
      setErro('Não foi possível identificar a clínica desta conta.')
      return
    }
    const horario = new Date(dataHora)
    if (!dataHora || Number.isNaN(horario.getTime())) {
      setErro('Informe uma data e um horário válidos.')
      return
    }
    const dataHoraUtc = horario.toISOString()
    setSalvando(true)
    try {
      const resposta = await fetch(consultaEditar
        ? `${API_URL}/agenda/update/${consultaEditar.id}`
        : `${API_URL}/agenda`, {
        method: consultaEditar ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pacientes_idpacientes: Number(pacienteId),
          doutor_iddoutor: Number(doutorId),
          servico_idservico: Number(servicoId),
          datahora: dataHoraUtc,
          clinica_cnpj: user.clinica_cnpj,
        })
      })

      if (!resposta.ok) {
        const texto = await resposta.text()
        let erro
        try {
          erro = texto ? JSON.parse(texto) : {}
        } catch {
          erro = { message: texto }
        }
        setErro(erro.message || erro.error || 'Não foi possível salvar o agendamento.')
        return
      }

      aoSalvar(dataHora)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o agendamento.')
    } finally {
      setSalvando(false)
    }
  }

  if (cadastroAberto) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[10px]" role="dialog" aria-modal="true">
          {cadastroAberto === 'paciente' ? (
            <PatientForm
              onNavigate={() => setCadastroAberto(null)}
              onNotice={setAvisoCadastro}
              notice={avisoCadastro}
              embedded
              onCancel={() => setCadastroAberto(null)}
              onSaved={(values) => { void handleCadastroConcluido('paciente', values) }}
            />
          ) : cadastroAberto === 'profissional' ? (
            <ProfessionalForm
              onNavigate={() => setCadastroAberto(null)}
              onNotice={setAvisoCadastro}
              notice={avisoCadastro}
              embedded
              onCancel={() => setCadastroAberto(null)}
              onSaved={(values) => { void handleCadastroConcluido('profissional', values) }}
            />
          ) : (
            <ServicoForm
              onNavigate={() => setCadastroAberto(null)}
              onNotice={setAvisoCadastro}
              notice={avisoCadastro}
              embedded
              onCancel={() => setCadastroAberto(null)}
              onSaved={(values) => { void handleCadastroConcluido('servico', values) }}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) aoFechar()
      }}
    >
      <section
        aria-labelledby="nova-consulta-titulo"
        aria-modal="true"
        className="w-full max-w-lg rounded-[10px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)] md:p-8"
        role="dialog"
      >
        <h2 id="nova-consulta-titulo" className="mb-6 text-2xl font-bold text-[#4f7161]">
          {consultaEditar ? 'Editar Consulta' : 'Nova Consulta'}
        </h2>
        <form className="space-y-4" onSubmit={handleSalvar}>
          <SearchablePersonSelect
            id="consulta-paciente"
            label="Paciente"
            createLabel="Cadastrar novo paciente"
            onCreate={() => { setAvisoCadastro(''); setCadastroAberto('paciente') }}
            loading={carregandoOpcoes}
            options={pacientes.map((paciente) => ({ id: paciente.idpacientes!, nome: paciente.nome }))}
            placeholder="Buscar paciente pelo nome"
            value={pacienteId}
            onChange={setPacienteId}
          />
          <SearchablePersonSelect
            id="consulta-doutor"
            label="Doutor(a)"
            createLabel="Cadastrar novo profissional"
            onCreate={() => { setAvisoCadastro(''); setCadastroAberto('profissional') }}
            loading={carregandoOpcoes}
            options={doutores.map((doutor) => ({ id: doutor.iddoutor!, nome: doutor.nome }))}
            placeholder="Buscar doutor pelo nome"
            value={doutorId}
            onChange={setDoutorId}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-sm text-gray-600" htmlFor="consulta-servico">Serviço</label>
              <button
                className="cursor-pointer text-sm font-medium text-[#4f7161] hover:underline"
                type="button"
                onClick={() => { setAvisoCadastro(''); setCadastroAberto('servico') }}
              >
                + Cadastrar novo serviço
              </button>
            </div>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#4f7161] focus:outline-none focus:ring-2 focus:ring-[#4f7161]/20"
              id="consulta-servico"
              required
              value={servicoId}
              onChange={(event) => setServicoId(event.target.value)}
              disabled={carregandoOpcoes || servicos.length === 0}
            >
              <option value="">
                {carregandoOpcoes ? 'Carregando serviços...' : 'Selecione um serviço'}
              </option>
              {servicos.map((servico) => (
                <option key={servico.idservico} value={servico.idservico}>
                  {servico.nome} — R$ {Number(servico.preco).toFixed(2)}
                </option>
              ))}
            </select>
            {!carregandoOpcoes && servicos.length === 0 && (
              <p className="text-xs text-red-700">Cadastre um serviço antes de agendar uma consulta.</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-gray-600" htmlFor="consulta-data">Data e Hora</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#4f7161] focus:outline-none focus:ring-2 focus:ring-[#4f7161]/20"
              id="consulta-data"
              required
              type="datetime-local"
              value={dataHora}
              onChange={(event) => setDataHora(event.target.value)}
            />
          </div>
          {erro && <p className="text-sm text-red-700" role="alert">{erro}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              type="button"
              onClick={aoFechar}
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-[#4f7161] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f5c4f] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={salvando || carregandoOpcoes || pacientes.length === 0 || doutores.length === 0 || servicos.length === 0}
              type="submit"
            >
              {salvando ? 'Salvando...' : consultaEditar ? 'Salvar alterações' : 'Salvar consulta'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function SearchablePersonSelect({
  id,
  label,
  createLabel,
  onCreate,
  loading,
  options,
  placeholder,
  value,
  onChange,
}: {
  id: string
  label: string
  createLabel?: string
  onCreate?: () => void
  loading: boolean
  options: Array<{ id: number; nome: string }>
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState('')
  const [aberto, setAberto] = useState(false)
  const selecionado = options.find((option) => String(option.id) === value)
  const filtradas = options.filter((option) => option.nome.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm text-gray-600" htmlFor={id}>{label}</label>
        {onCreate && (
          <button
            type="button"
            className="cursor-pointer text-sm font-medium text-[#4f7161] hover:underline"
            onClick={onCreate}
          >
            + {createLabel}
          </button>
        )}
      </div>
      <div className="relative">
        <input
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-800 focus:border-[#4f7161] focus:outline-none focus:ring-2 focus:ring-[#4f7161]/20"
          id={id}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={aberto}
          aria-controls={`${id}-options`}
          aria-autocomplete="list"
          required={!value}
          value={query || selecionado?.nome || ''}
          onFocus={() => setAberto(true)}
          onBlur={() => setAberto(false)}
          onChange={(event) => {
            setQuery(event.target.value)
            setAberto(true)
            if (value) onChange('')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setAberto(false)
            if (event.key === 'Enter' && aberto && filtradas.length === 1) {
              event.preventDefault()
              onChange(String(filtradas[0].id))
              setQuery('')
              setAberto(false)
            }
          }}
        />
        {aberto && (
          <ul
            className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            id={`${id}-options`}
            role="listbox"
          >
            {loading ? (
              <li className="px-3 py-2 text-sm text-gray-500">Carregando...</li>
            ) : filtradas.length ? filtradas.map((option) => (
              <li key={option.id} role="option" aria-selected={String(option.id) === value}>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-[#edf4ef] focus:bg-[#edf4ef] focus:outline-none"
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(String(option.id))
                    setQuery('')
                    setAberto(false)
                  }}
                >
                  {option.nome}
                </button>
              </li>
            )) : (
              <li className="px-3 py-2 text-sm text-gray-500">Nenhum resultado encontrado</li>
            )}
          </ul>
        )}
      </div>
      {selecionado && !aberto && <p className="text-xs text-[#4f7161]">Selecionado: {selecionado.nome}</p>}
    </div>
  )
}