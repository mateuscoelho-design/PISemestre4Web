//requerer somente o metodo datatypes do sequelize
const {DataTypes} = require('sequelize')
//requerer a conexão
const conn = require('../db/conn.js')

//definir o model user
const Doutor = conn.define('doutor',{
    iddoutor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome:{
        type: DataTypes.STRING,
        required: true
    },
    especialidade:{
        type: DataTypes.STRING,
        required: true
    },
    clinica_cnpj:{
        type: DataTypes.STRING,
        required: true
    },
    documento:{
        type: DataTypes.INTEGER,
        required: true
    }
}, {
    tableName: 'doutor',
    timestamps: false
})

module.exports = Doutor