require('dotenv').config({ path: require('path').join(__dirname, '.env') })

if (!process.env.CHAVETOKEN?.trim()) {
    console.error('CHAVETOKEN não configurada. Defina essa variável no ambiente ou em backend/.env.')
    process.exit(1)
}

//requere o express
const express = require('express')
//instacia do express
const api = express()
//require cors
const cors = require('cors')
//requerer a conexão
const conn = require('./db/conn.js')
//requerer os Models
const User = require('./models/Users.js')
const Clinica = require('./models/Clinica.js')
const Tag = require('./models/Tag.js')
const Plano = require('./models/Plano.js')
const Paciente = require('./models/Paciente.js')
const Doutor = require('./models/Doutor.js')
const Agenda = require('./models/Agenda.js')
const Anaminese = require('./models/Anaminese.js')
//requer a rotas ros usuarios (user)
const userRoutes = require('./routers/userRoutes.js')
const clinicaRoutes = require('./routers/clinicaRoutes.js')
const doutorRoutes = require('./routers/doutorRoutes.js')
const pacienteRoutes = require('./routers/pacienteRoutes.js')
const planoRoutes = require('./routers/planoRoutes.js')
const servicesRoutes = require('./routers/servicesRoutes.js')
const tagRoutes = require('./routers/tagRoutes.js')
const agendaRoutes = require('./routers/agendaRoutes.js')
const anamineseRoutes = require('./routers/anamineseRoutes.js')
const documentRoutes = require('./routers/documentRoutes.js')
const tagpacienteRoutes = require('./routers/tagpacienteRoutes.js')

api.get('/api/health', (req, res) => res.json({ status: 'ok' }))

//configurando JSON response
api.use(express.json())

//salve cors
//api.use(cors({credentials: true, origin: 'http://localhost:5000'}))
api.use(cors())

api.use('/users',userRoutes)
api.use('/clinicas', clinicaRoutes)
api.use('/doutores', doutorRoutes)
api.use('/pacientes', pacienteRoutes)
api.use('/tag', tagRoutes)
api.use('/plano', planoRoutes)
api.use('/servicos', servicesRoutes)
api.use('/agenda', agendaRoutes)
api.use('/anaminese', anamineseRoutes)
api.use('/documentos', documentRoutes)
api.use('/tagpaciente', tagpacienteRoutes)

//start api
conn.sync()
    .then(() => {
        const port = Number(process.env.PORT) || 5000
        api.listen(port, '0.0.0.0', () => {
            console.info(`API disponível na porta ${port}`)
        })
    })
    .catch(error => {
        console.error('Não foi possível iniciar a API:', error)
        process.exitCode = 1
    })
