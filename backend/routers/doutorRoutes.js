// Express Router 
const route = require('express').Router()
const { validationResult } = require('express-validator')

//requerer o controller no UserController
const DoutorController = require('../controlers/doutorController')
//requerer as validacoes
//const {registerValidationRules, validate} = require('../helpers/Validator')

//rotas
//register
//route.post('/register',registerValidationRules(), validate, DoutorController.register)

//listar todos
route.get('/', DoutorController.listAll)

module.exports = route