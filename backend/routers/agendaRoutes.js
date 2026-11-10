const route = require('express').Router()
const AgendaController = require('../controlers/agendaController')
const verifyToken = require('../helpers/verify-token.js')

route.get('/', verifyToken, AgendaController.listAll)
route.get('/movimento-por-plano', verifyToken, AgendaController.movimentoPorPlano)
route.post('/', verifyToken, AgendaController.register)
route.put('/update/:idagenda', verifyToken, AgendaController.update)
route.delete('/delete/:idagenda', verifyToken, AgendaController.delete)

module.exports = route