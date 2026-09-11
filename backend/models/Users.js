//requerer somente o metodo datatypes do sequelize
const {DataTypes} = require('sequelize')
//requerer a conexão
const conn = require('../db/conn.js')

//definir o model user
const User = conn.define('usuario',{
    idusuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario:{
        type: DataTypes.STRING,
        required: true
    },
    email:{
        type: DataTypes.STRING,
        required: true
    },
    senha:{
        type: DataTypes.STRING,
        required: true
    },
    tipo:{
        type: DataTypes.TINYINT,
        required: true
    },
    clinica_cnpj:{
        type: DataTypes.STRING,
        required: true
    }
}, {
    tableName: 'usuario',
    timestamps: false
})

module.exports = User