import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import type { EventClickArg, EventInput } from '@fullcalendar/core'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import NovaConsultaModal from './NovaConsultaModal'
import DetalhesConsultaModal from './DetalhesConsultaModal'
import { useAuth } from '../../context/AuthContext'
import { API_URL, messageFrom, readResponse } from '../../services/api'

type AgendamentoApi = {
    idagenda: number
    pacientes_idpacientes: number
    datahora: string
    doutor_iddoutor: number
    servico_idservico: number | null
    status: string
}

type ServicoApi = {
    idservico: number
    nome: string
    preco: number
}

type PessoaApi = {
    idpacientes?: number
    iddoutor?: number
    nome: string
    telefone?: string
    email?: string
}

type ConsultaSelecionada = {
    id: string
    titulo: string
    inicio: Date
    pacienteId: number
    doutorId: number
    servicoId: number | null
    pacienteNome: string
    pacienteTelefone?: string
    pacienteEmail?: string
    doutorNome: string
    servicoNome: string
    servicoPreco?: number
    status: string
}

function parseDataHoraLocal(value: string) {
    if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(value)) {
        const data = new Date(value)
        if (Number.isNaN(data.getTime())) {
            throw new Error('A API retornou um horário inválido para um agendamento.')
        }
        return data
    }

    const partes = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?/.exec(value)
    if (partes) {
    
        return new Date(
            Number(partes[1]),
            Number(partes[2]) - 1,
            Number(partes[3]),
            Number(partes[4]),
            Number(partes[5]),
            Number(partes[6] ?? 0),
            Number((partes[7] ?? '').padEnd(3, '0') || 0),
        )
    }

    const data = new Date(value)
    if (Number.isNaN(data.getTime())) {
        throw new Error('A API retornou um horário inválido para um agendamento.')
    }
    return data
}

export function Agenda({ permitirNavegacao = false }: { permitirNavegacao?: boolean }){
    const [eventos, setEventos] = useState<EventInput[]>([])
    const [erroAgenda, setErroAgenda] = useState('')
    const calendarioRef = useRef<FullCalendar | null>(null)
    const coresDoutores = useRef<{ chave: string; cores: Map<number, string> } | null>(null)
    const { user } = useAuth()
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - ((inicioSemana.getDay() + 6) % 7))
    inicioSemana.setHours(0, 0, 0, 0)
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(fimSemana.getDate() + 7)
    // Mostra o horário atual com uma hora anterior visível ao abrir a agenda.
    const horarioInicial = `${String(Math.max(0, new Date().getHours() - 1)).padStart(2, '0')}:00:00`
    // Como combinado gente, os agendamentos serão feitos através de
    // um botão que abre uma janela na tela para inserir as informacoes

    const [modalNovaAberto, setModalNovaAberto] = useState(false)

    const [eventoSelecionado, setEventoSelecionado] = useState<ConsultaSelecionada | null>(null)

    function obterCorDoutor(doutorId: number) {
        const chave = `@App:agenda:cores-doutores:${user?.clinica_cnpj ?? 'sem-clinica'}`
        if (coresDoutores.current?.chave !== chave) {
            const coresSalvas = JSON.parse(localStorage.getItem(chave) ?? '{}') as Record<string, string>
            coresDoutores.current = {
                chave,
                cores: new Map(Object.entries(coresSalvas).map(([id, cor]) => [Number(id), cor])),
            }
        }

        const cores = coresDoutores.current.cores
        const corExistente = cores.get(doutorId)
        if (corExistente) return corExistente

        const coresUsadas = new Set(cores.values())
        let cor: string
        do {
            cor = `hsl(${Math.floor(Math.random() * 360)}, 65%, 38%)`
        } while (coresUsadas.has(cor))

        cores.set(doutorId, cor)
        localStorage.setItem(chave, JSON.stringify(Object.fromEntries(cores)))
        return cor
    }

    useEffect(() => {
        buscarAgendamentos()
    }, [])

    async function buscarAgendamentos() {
        setErroAgenda('')
        try {
            const token = localStorage.getItem('@App:token')
            const headers: Record<string, string> = token
                ? { Authorization: `Bearer ${token}` }
                : {}
            const [agendaResponse, pacientesResponse, doutoresResponse, servicosResponse] = await Promise.all([
                fetch(`${API_URL}/agenda`, { headers }),
                fetch(`${API_URL}/pacientes/listarByCNPJ`, { headers }),
                fetch(`${API_URL}/doutores/listarByCNPJ`, { headers }),
                fetch(`${API_URL}/servicos`, { headers }),
            ])
            const agendaData = await readResponse(agendaResponse) as {
                agendamentos?: AgendamentoApi[]
                message?: string
                errors?: { msg?: string }[]
            }
            if (!agendaResponse.ok) throw new Error(messageFrom(agendaData))
            if (!Array.isArray(agendaData.agendamentos)) {
                throw new Error('A API retornou uma lista de agendamentos inválida.')
            }

            const pacientesData: { pacientes: PessoaApi[] } = pacientesResponse.ok
                ? await pacientesResponse.json()
                : { pacientes: [] }
            const doutoresData: { doutores: PessoaApi[] } = doutoresResponse.ok
                ? await doutoresResponse.json()
                : { doutores: [] }
            const servicosData: { servicos: ServicoApi[] } = servicosResponse.ok
                ? await servicosResponse.json()
                : { servicos: [] }
            const pacientesPorId = new Map(pacientesData.pacientes.map(paciente => [
                paciente.idpacientes!,
                { nome: paciente.nome, telefone: paciente.telefone, email: paciente.email },
            ]))
            const nomesDoutores = new Map(doutoresData.doutores.map(doutor => [doutor.iddoutor!, doutor.nome]))
            const servicosPorId = new Map(servicosData.servicos.map(servico => [
                servico.idservico,
                { nome: servico.nome, preco: Number(servico.preco) },
            ]))

            setEventos(agendaData.agendamentos.map((agendamento) => {
                const paciente = pacientesPorId.get(agendamento.pacientes_idpacientes)
                const pacienteNome = paciente?.nome ?? `Paciente #${agendamento.pacientes_idpacientes}`
                const doutorNome = nomesDoutores.get(agendamento.doutor_iddoutor) ?? `Doutor #${agendamento.doutor_iddoutor}`
                const servico = agendamento.servico_idservico == null
                    ? undefined
                    : servicosPorId.get(agendamento.servico_idservico)
                const servicoNome = servico?.nome
                    ?? (agendamento.servico_idservico == null
                        ? 'Serviço não informado'
                        : `Serviço #${agendamento.servico_idservico}`)
                const corDoutor = obterCorDoutor(agendamento.doutor_iddoutor)
                return {
                    id: String(agendamento.idagenda),
                    title: `${pacienteNome} · ${doutorNome}`,
                    start: parseDataHoraLocal(agendamento.datahora),
                    backgroundColor: corDoutor,
                    borderColor: corDoutor,
                    extendedProps: {
                        pacienteId: agendamento.pacientes_idpacientes,
                        doutorId: agendamento.doutor_iddoutor,
                        servicoId: agendamento.servico_idservico,
                        pacienteNome,
                        pacienteTelefone: paciente?.telefone,
                        pacienteEmail: paciente?.email,
                        doutorNome,
                        servicoNome,
                        servicoPreco: servico?.preco,
                        status: agendamento.status,
                    },
                }
            }))
        } catch (error) {
            setEventos([])
            setErroAgenda(error instanceof Error ? error.message : 'Não foi possível carregar os agendamentos.')
        }
    }

    // quando a pessoa clica em um evento(agendamento)
    function handleEventClick(info: EventClickArg) {
        const detalhes = info.event.extendedProps as Pick<ConsultaSelecionada, 'pacienteId' | 'doutorId' | 'servicoId' | 'pacienteNome' | 'pacienteTelefone' | 'pacienteEmail' | 'doutorNome' | 'servicoNome' | 'servicoPreco' | 'status'>
        setEventoSelecionado({
            id: info.event.id,
            titulo: info.event.title,
            inicio: info.event.start ?? new Date(),
            ...detalhes
        })
    }
    
    return(
        <div>
            <button
                className="mb-3 rounded-md bg-[#4f7161] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#3f5c4f]"
                onClick={() => setModalNovaAberto(true)}
            >
                + Nova consulta
            </button>

            {erroAgenda && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                    <span>{erroAgenda}</span>
                    <button className="font-semibold underline" onClick={() => void buscarAgendamentos()} type="button">
                        Tentar novamente
                    </button>
                </div>
            )}

            <div className="agenda-calendar overflow-x-auto">
                <FullCalendar
                    ref={calendarioRef}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    initialDate={new Date()}
                    firstDay={1}
                    validRange={permitirNavegacao ? undefined : { start: inicioSemana, end: fimSemana }}
                    headerToolbar={permitirNavegacao
                        ? { left: 'title', right: 'prev,next today' }
                        : false}
                    allDaySlot={false}
                    locale={ptBrLocale}
                    eventClick={handleEventClick}
                    events={eventos}
                    height={650}
                    nowIndicator={true}
                    scrollTime={horarioInicial}
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    slotEventOverlap={false}
                    eventContent={(info) => (
                        <div className="flex min-w-0 flex-col overflow-hidden px-1 py-0.5 text-xs leading-tight">
                            <span className="truncate font-semibold">{info.event.extendedProps.pacienteNome}</span>
                            <span className="truncate opacity-90">{info.event.extendedProps.doutorNome}</span>
                            <span className="truncate opacity-90">{info.event.extendedProps.servicoNome}</span>
                        </div>
                    )}
                />
            </div>

            {modalNovaAberto && (
                <NovaConsultaModal
                aoFechar={() => setModalNovaAberto(false)}
                aoSalvar={(dataHora) => {
                    setModalNovaAberto(false)
                    calendarioRef.current?.getApi().gotoDate(parseDataHoraLocal(dataHora))
                    void buscarAgendamentos()
                }}
                />
            )}

            {eventoSelecionado && (
                <DetalhesConsultaModal
                    consulta={eventoSelecionado}
                    aoFechar={() => setEventoSelecionado(null)}
                    aoExcluir={() => {
                        setEventoSelecionado(null)
                        buscarAgendamentos()
                    }}
                    aoAtualizar={(dataHora) => {
                        setEventoSelecionado(null)
                        calendarioRef.current?.getApi().gotoDate(parseDataHoraLocal(dataHora))
                        void buscarAgendamentos()
                    }}
                />
            )}

        
        </div>
    )
}