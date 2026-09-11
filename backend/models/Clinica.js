//requerer somente o metodo datatypes do sequelize
const {DataTypes} = require('sequelize')
//requerer a conexão
const conn = require('../db/conn.js')

//definir o model user
const Clinica = conn.define('clinica',{
    cnpj: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nome:{
        type: DataTypes.STRING,
        required: true
    },
}, {
    tableName: 'clinica',
    timestamps: false
})

module.exports = Clinica