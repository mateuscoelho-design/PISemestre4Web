//requerer o model do usuario
const User = require('../models/Users')

const createUserToken = require('../helpers/create-user-token')

//requerer biblioteca bcrypt
const bcrypt = require('bcrypt')

module.exports = class UserController{
    static async register(req, res){
        const {usuario, email, senha, tipo, clinica_cnpj} = req.body

        //criptografar senha
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(senha, salt)

        //criar novo usuario
        try{
            await User.create({
                usuario: usuario,
                email: email,
                senha: passwordHash,
                tipo: tipo,
                clinica_cnpj: clinica_cnpj
            })
            res.status(200).json({message:'Usuario Cadastrado com sucesso'})
        }catch(error){
            res.status(500).json({message: error})
        }
    }

    static async login(req, res){
        //requerer pelo body os parametros
        const {email, senha} = req.body

        //verificar se o usuario existe
        const user = await User.findOne({where:{email:email}})

        if(!user){
            res.status(422).json({
                message:"Não há usuário cadastrado com esse e-mail"
            })
            return
        }

        //verificar password
        const checkPassword = await bcrypt.compare(senha, user.senha)

        //retornar mensagem para senha incorreta
        if(!checkPassword){
            res.status(422).json({
                message: "Senha Invalida"
            })
            return
        }

        //geramos o token para o usuario
        await createUserToken(user, req, res)
    }

    //metodo para listar todos os usuarios
    static async listAll(req, res){
        try{
            const users = await User.findAll()
            res.status(200).json({users:users})
        }
        catch(error){
            res.status(500).json({error: error})
        }
    }
}