const Agenda = require('../models/Agenda')
const Servicos = require('../models/Services')
const Paciente = require('../models/Paciente')
const Doutor = require('../models/Doutor')
const { QueryTypes } = require('sequelize')

// Valida os dados usados tanto no cadastro quanto na edição de consultas.
async function validarDadosConsulta(dados, clinicaCnpj) {
    const pacienteId = Number(dados.pacientes_idpacientes)
    const doutorId = Number(dados.doutor_iddoutor)
    const servicoId = Number(dados.servico_idservico)
    const data = typeof dados.datahora === 'string' ? new Date(dados.datahora) : new Date(NaN)

    if (![pacienteId, doutorId, servicoId].every(id => Number.isInteger(id) && id > 0)) {
        return { status: 400, message: 'Selecione um paciente, um profissional e um serviço válidos.' }
    }
    if (Number.isNaN(data.getTime())) {
        return { status: 400, message: 'Informe uma data e um horário válidos.' }
    }

    const [paciente, doutor, servico] = await Promise.all([
        Paciente.findOne({ where: { idpacientes: pacienteId, clinica_cnpj: clinicaCnpj } }),
        Doutor.findOne({ where: { iddoutor: doutorId, clinica_cnpj: clinicaCnpj } }),
        Servicos.findOne({ where: { idservico: servicoId, clinica_cnpj: clinicaCnpj } })
    ])
    if (!paciente || !doutor || !servico) {
        return { status: 404, message: 'Paciente, profissional ou serviço não encontrado nesta clínica.' }
    }

    return {
        dados: {
            datahora: data,
            doutor_iddoutor: doutorId,
            pacientes_idpacientes: pacienteId,
            servico_idservico: servicoId,
            clinica_cnpj: clinicaCnpj
        }
    }
}

module.exports = class AgendaController {
    static async movimentoPorPlano(req, res) {
        const clinicaCnpj = req.user.clinica_cnpj
        const agora = new Date()
        const primeiroMes = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - 5, 1))
        const proximoMes = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() + 1, 1))
        const meses = Array.from({ length: 6 }, (_, indice) => {
            const data = new Date(Date.UTC(
                primeiroMes.getUTCFullYear(),
                primeiroMes.getUTCMonth() + indice,
                1
            ))
            return data.toISOString().slice(0, 7)
        })

        try {
            const registros = await Agenda.sequelize.query(`
                SELECT
                    p.idplano,
                    p.descricao,
                    DATE_FORMAT(a.datahora, '%Y-%m') AS mes,
                    COUNT(a.idagenda) AS total
                FROM plano p
                LEFT JOIN pacientes pa
                    ON pa.plano_idplano = p.idplano
                    AND pa.clinica_cnpj = p.clinica_cnpj
                LEFT JOIN agenda a
                    ON a.pacientes_idpacientes = pa.idpacientes
                    AND a.clinica_cnpj = p.clinica_cnpj
                    AND a.datahora >= :inicio
                    AND a.datahora < :fim
                WHERE p.clinica_cnpj = :clinicaCnpj
                GROUP BY p.idplano, p.descricao, DATE_FORMAT(a.datahora, '%Y-%m')
                ORDER BY p.descricao
            `, {
                replacements: {
                    clinicaCnpj,
                    inicio: `${meses[0]}-01 00:00:00`,
                    fim: `${proximoMes.toISOString().slice(0, 10)} 00:00:00`
                },
                type: QueryTypes.SELECT
            })

            const planos = new Map()
            for (const registro of registros) {
                const idplano = Number(registro.idplano)
                if (!planos.has(idplano)) {
                    planos.set(idplano, {
                        idplano,
                        descricao: registro.descricao,
                        movimento: Array(meses.length).fill(0)
                    })
                }

                const indiceMes = meses.indexOf(registro.mes)
                if (indiceMes >= 0) {
                    planos.get(idplano).movimento[indiceMes] = Number(registro.total)
                }
            }

            return res.status(200).json({ meses, planos: [...planos.values()] })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }

    static async listAll(req, res) {
        try {
            const agendamentos = await Agenda.findAll({
                where: { clinica_cnpj: req.user.clinica_cnpj }
            })
            return res.status(200).json({ agendamentos })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }

    static async register(req, res) {
        try {
            const validacao = await validarDadosConsulta(req.body, req.user.clinica_cnpj)
            if (validacao.status) {
                return res.status(validacao.status).json({ message: validacao.message })
            }

            const agendamento = await Agenda.create(validacao.dados)
            return res.status(201).json({ agendamento })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }

    static async update(req, res) {
        const idagenda = Number(req.params.idagenda)
        if (!Number.isInteger(idagenda) || idagenda <= 0) {
            return res.status(400).json({ message: 'Agendamento inválido.' })
        }

        try {
            const agendamento = await Agenda.findOne({
                where: { idagenda, clinica_cnpj: req.user.clinica_cnpj }
            })
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado.' })
            }

            const validacao = await validarDadosConsulta(req.body, req.user.clinica_cnpj)
            if (validacao.status) {
                return res.status(validacao.status).json({ message: validacao.message })
            }

            await agendamento.update(validacao.dados)
            return res.status(200).json({ message: 'Agendamento atualizado com sucesso.', agendamento })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }

    static async delete(req, res) {
        const { idagenda } = req.params
        const clinica_cnpj = req.user.clinica_cnpj

        try {
            const agendamento = await Agenda.findOne({
                where: { idagenda, clinica_cnpj }
            })
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            await agendamento.destroy()
            return res.status(200).json({ message: 'Agendamento apagado com sucesso' })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }
}