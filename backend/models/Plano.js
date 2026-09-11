//requerer somente o metodo datatypes do sequelize
const {DataTypes} = require('sequelize')
//requerer a conexão
const conn = require('../db/conn.js')

//definir o model user
const Plano = conn.define('plano',{
    idplano: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descricao:{
        type: DataTypes.STRING,
        required: true
    },
    aplicadesconto:{
        type: DataTypes.TINYINT,
        required: true
    },
    valordesconto:{
        type: DataTypes.FLOAT,
        //required: true
    },
    exonera:{
        type: DataTypes.TINYINT,
        required: true
    },
    clinica_cnpj:{
        type: DataTypes.STRING,
        required: true
    }
}, {
    tableName: 'plano',
    timestamps: false
})

module.exports = Plano