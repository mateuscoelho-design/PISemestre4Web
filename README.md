# EasyClinic

Sistema de gerenciamento clínico desenvolvido como parte do **Projeto Integrado do 4º semestre — Módulo de Aplicação Web**.

O EasyClinic tem como objetivo auxiliar no gerenciamento administrativo de clínicas e consultórios, reunindo funcionalidades relacionadas a clínicas, usuários, pacientes, profissionais e agendamentos.

> **Status:** projeto em desenvolvimento. Existem funcionalidades implementadas parcialmente e outras previstas nos requisitos que ainda não estão disponíveis na aplicação atual.

---

## Sobre o projeto

O EasyClinic é composto por:

* uma interface web desenvolvida com React;
* uma API desenvolvida com Node.js e Express;
* persistência de dados utilizando Sequelize;
* banco de dados relacional;
* autenticação baseada em JWT.

Na versão atual do projeto estão presentes funcionalidades relacionadas a:

* cadastro de clínica;
* cadastro do primeiro usuário;
* login por e-mail e senha;
* autenticação por token JWT;
* cadastro de pacientes;
* listagem e pesquisa de pacientes;
* cadastro de profissionais;
* listagem e pesquisa de profissionais;
* utilização de tags e planos no cadastro de pacientes;
* visualização semanal da agenda;
* criação básica de agendamentos.

Nem todas as funcionalidades existentes no backend possuem interface completa no front-end.

---

## Empresa beneficiada

**Consultório Dr. Márcio Magalhães Paiva**
Otorrinolaringologista — São José do Rio Pardo/SP.

---

# Tecnologias utilizadas

## Front-end

* React;
* TypeScript;
* Vite;
* Tailwind CSS;
* FullCalendar;
* JWT Decode.

## Back-end

* Node.js;
* Express;
* Sequelize;
* MySQL;
* MySQL2;
* JSON Web Token;
* bcrypt;
* express-validator;
* CORS;
* dotenv;
* Nodemon.

---

# Estrutura geral

```text
PISemestre4Web/
│
├── backend/
│   ├── controlers/
│   ├── db/
│   ├── helpers/
│   ├── models/
│   ├── routers/
│   ├── package.json
│   └── server.js
│
├── bd/
│
├── docs/
│   ├── casos_de_uso/
│   ├── rf.md
│   ├── rn.md
│   └── rnf.md
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# Front-end

A aplicação principal está localizada no diretório `src/`.

Atualmente, o controle de navegação é realizado pelo próprio estado da aplicação, através do `App.tsx`.

As telas existentes são:

* Login;
* Cadastro;
* Início;
* Pacientes;
* Profissionais;
* Cadastro de paciente;
* Cadastro de profissional.

As telas internas verificam a existência de autenticação antes de serem exibidas.

A API local utiliza `http://localhost:5000`. Em desenvolvimento, o front-end usa esse endereço por padrão. Para configurar outro endereço, crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:5000
```

Para publicar, configure `VITE_API_URL` no ambiente de build do front-end com a URL pública da API (por exemplo, `https://api.seudominio.com`). Se o front-end e a API forem servidos pelo mesmo domínio, essa variável pode ficar vazia para usar o mesmo host. Configure também `PORT` no ambiente do backend; localmente a API usa `5000` por padrão. O backend escuta em todas as interfaces de rede, como esperado por serviços de hospedagem na AWS.

---

# Cadastro inicial

A tela de cadastro solicita informações da clínica e do primeiro usuário.

## Clínica

* nome;
* CNPJ.

## Usuário

* nome;
* e-mail;
* senha.

No front-end, o usuário criado nesse fluxo é enviado com:

```text
tipo: 1
```

que corresponde ao perfil utilizado como master pelo projeto.

O fluxo atual realiza duas requisições diferentes:

```http
POST /clinicas/register
```

seguida de:

```http
POST /users/register
```

Portanto, o cadastro de clínica e usuário **não é atualmente uma única operação transacional**.

Caso o cadastro do usuário falhe após a criação da clínica, o código atual não realiza automaticamente o rollback da clínica já cadastrada.

---

# Autenticação

O login utiliza:

```text
E-mail
Senha
```

através da rota:

```http
POST /users/login
```

Quando as credenciais são válidas, o backend gera um JWT contendo:

```text
usuario
idusuario
tipo
clinica_cnpj
```

O token é configurado para expirar em:

```text
1 hora
```

No front-end, ele é armazenado no `localStorage` utilizando:

```text
@App:token
```

O contexto de autenticação também decodifica o JWT para recuperar as informações do usuário.

Ao carregar a aplicação, tokens já expirados são removidos do armazenamento local.

---

## Rotas protegidas

Nas requisições protegidas, o token é enviado utilizando:

```http
Authorization: Bearer <token>
```

O middleware do backend verifica a assinatura e validade do JWT antes de permitir a continuação da requisição.

Atualmente, esse middleware é utilizado nas rotas relacionadas a:

* pacientes;
* profissionais;
* tags;
* planos;
* consulta e manutenção de usuários.

Entretanto, nem todas as rotas da API possuem a mesma proteção atualmente.

As rotas de clínica e agenda, por exemplo, ainda não utilizam o middleware de autenticação em sua implementação atual.

---

# Pacientes

O cadastro de pacientes possui os seguintes campos:

* nome;
* CPF;
* telefone;
* e-mail;
* complemento;
* tag;
* plano.

Antes de apresentar as opções de tag e plano, o front-end consulta:

```http
GET /tag/listarByCNPJ
GET /plano/listarByCNPJ
```

A listagem de pacientes utiliza:

```http
GET /pacientes/listarByCNPJ
```

Essa requisição utiliza o token JWT, permitindo que o backend obtenha o CNPJ da clínica a partir do usuário autenticado.

A pesquisa apresentada na interface atualmente é realizada no próprio front-end sobre os registros carregados.

---

# Profissionais

Os profissionais são chamados de `doutor` na estrutura interna do backend.

O cadastro possui:

* nome;
* especialidade;
* documento/CRM.

A listagem utiliza:

```http
GET /doutores/listarByCNPJ
```

Assim como nos pacientes, a busca exibida pela interface é realizada localmente sobre os registros carregados.

---

# Agenda

A agenda utiliza o FullCalendar com visualização semanal:

```text
timeGridWeek
```

O componente consulta os agendamentos utilizando:

```http
GET /agenda
```

e permite enviar um novo agendamento através de:

```http
POST /agenda
```

A estrutura persistida atualmente para um agendamento contém:

* identificador;
* data e hora;
* profissional;
* paciente;
* clínica.

A tabela e o model atuais não possuem campos próprios para:

* horário de término;
* status da consulta.

Embora componentes da interface possuam partes preparadas para informações adicionais, esses campos ainda não fazem parte da estrutura atual do model `Agenda`.

### Limitações atuais da agenda

A implementação da agenda ainda precisa de ajustes importantes.

Atualmente:

* `GET /agenda` lista os agendamentos sem autenticação;
* `POST /agenda` cria agendamentos sem autenticação;
* a listagem não é filtrada pela clínica autenticada;
* não existe validação de conflito de horários no controller atual;
* não existe operação de reagendamento;
* não existe operação de cancelamento;
* não existe controle persistente de status;
* o banco atual registra somente uma data/hora por consulta.

Esses comportamentos podem ser evoluídos de acordo com os requisitos definidos para o projeto.

---

# API

A API é registrada no servidor Express através dos seguintes grupos:

```text
/users
/clinicas
/doutores
/pacientes
/tag
/plano
/agenda
```

---

## Usuários

```http
POST /users/register
POST /users/login

POST /users/update/:idusuario
POST /users/delete/:idusuario

GET /users
GET /users/listarByCNPJ
```

Cadastro e login são públicos na implementação atual.

As demais rotas acima utilizam autenticação JWT.

---

## Clínicas

```http
POST /clinicas/register
POST /clinicas/update/:idclinica
GET  /clinicas
```

As rotas de clínica não utilizam atualmente o middleware JWT.

---

## Pacientes

```http
POST /pacientes/register
POST /pacientes/update/:idpaciente
POST /pacientes/delete/:idpaciente

GET /pacientes
GET /pacientes/listarByCNPJ
```

As rotas de pacientes utilizam autenticação JWT.

---

## Profissionais

```http
POST /doutores/register
POST /doutores/update/:iddoutor
POST /doutores/delete/:iddoutor

GET /doutores
GET /doutores/listarByCNPJ
```

As rotas de profissionais utilizam autenticação JWT.

---

## Tags

```http
POST /tag/register
POST /tag/update/:idtag
POST /tag/delete/:idtag

GET /tag
GET /tag/listarByCNPJ
```

As rotas de tags utilizam autenticação JWT.

---

## Planos

```http
POST /plano/register
POST /plano/update/:idplano
POST /plano/delete/:idplano

GET /plano
GET /plano/listarByCNPJ
```

As rotas de planos utilizam autenticação JWT.

---

## Agenda

```http
GET  /agenda
POST /agenda
```

As rotas de agenda não utilizam autenticação JWT atualmente.

---

# Banco de dados

O EasyClinic utiliza banco de dados relacional.

O Sequelize está configurado atualmente com:

```text
dialect: mysql
host: localhost
port: 3306
database: easyclinic
user: root
```

Na configuração atual do projeto, a senha do usuário `root` está vazia.

Essa configuração é adequada apenas para o ambiente local em que o projeto foi desenvolvido e deve ser ajustada de acordo com o ambiente utilizado.

---

## Estrutura atual

A estrutura SQL existente no projeto contém as seguintes tabelas:

```text
clinica
tag
plano
pacientes
usuario
doutor
agenda
```

As principais relações são:

```text
clinica
 ├── usuario
 ├── tag
 ├── plano
 ├── pacientes
 ├── doutor
 └── agenda

tag ─────── pacientes
plano ───── pacientes

pacientes ─┐
           ├── agenda
doutor ────┘
```

A clínica é utilizada como referência em diferentes entidades através do CNPJ.

Pacientes possuem relacionamento com:

* clínica;
* tag;
* plano.

Agendamentos possuem relacionamento com:

* clínica;
* paciente;
* profissional.

---

## Observação sobre o script atual

O script SQL existente no projeto executa:

```sql
DROP DATABASE IF EXISTS easyclinic;
```

antes de criar novamente o banco.

Isso significa que executá-lo em uma base existente chamada `easyclinic` remove os dados já armazenados nela.

O script deve ser utilizado com cuidado, principalmente fora do ambiente de desenvolvimento.

---

# Modelagem e evolução do banco

Além da estrutura atualmente utilizada pela aplicação, foi desenvolvida uma modelagem revisada para orientar a evolução do banco de dados.

Essa modelagem busca melhorar aspectos como:

* integridade referencial;
* controle de registros ativos;
* unicidade;
* isolamento entre clínicas;
* gerenciamento do período das consultas;
* regras para situações de agendamento;
* consistência entre requisitos e persistência.

Essas alterações representam uma **proposta de evolução**.

Elas não devem ser consideradas automaticamente implementadas no backend atual.

Qualquer alteração na estrutura física do banco deve ser acompanhada pelas alterações correspondentes nos models, controllers e demais partes da API.

---

# Requisitos Funcionais

Os Requisitos Funcionais descrevem os comportamentos esperados para o sistema.

Eles abrangem áreas como:

* cadastro inicial;
* autenticação;
* usuários;
* pacientes;
* profissionais;
* tags;
* planos;
* agenda;
* gerenciamento das consultas.

Os requisitos representam **o comportamento especificado para o EasyClinic**.

Portanto, um requisito documentado não significa necessariamente que a funcionalidade correspondente já esteja concluída no código atual.

---

# Requisitos Não Funcionais

Os Requisitos Não Funcionais estabelecem critérios relacionados à qualidade e às restrições do sistema, incluindo:

* segurança;
* autorização;
* integridade;
* desempenho;
* concorrência;
* usabilidade;
* acessibilidade;
* compatibilidade;
* privacidade;
* recuperação;
* manutenção.

Quando os RNF estabelecem metas de desempenho ou segurança ainda não implementadas, elas devem ser interpretadas como requisitos para desenvolvimento e homologação, não como características já comprovadas da versão atual.

---

# Regras de Negócio

As Regras de Negócio definem restrições e comportamentos relacionados ao domínio do EasyClinic.

Elas são diferentes dos Requisitos Não Funcionais.

De forma simplificada:

```text
RF  → o que o sistema deve fazer

RN  → regras do domínio que determinam como determinadas operações funcionam

RNF → condições de qualidade, segurança, desempenho e funcionamento
```

---

# Implementação atual e especificação

O projeto possui duas perspectivas que devem ser diferenciadas.

## Implementação atual

Representa aquilo que efetivamente existe no código:

```text
Interface React
      ↓
API Express
      ↓
Sequelize
      ↓
Banco de dados
```

## Especificação

Representa os comportamentos e melhorias definidos para orientar a evolução do EasyClinic.

Os RF, RN e RNF podem, portanto, descrever funcionalidades ou garantias que ainda precisam ser implementadas.

Essa distinção evita apresentar como concluída uma funcionalidade que existe somente na especificação.

---

# Como executar

## Pré-requisitos

Para executar o projeto localmente é necessário possuir:

* Git;
* Node.js;
* npm;
* servidor MySQL compatível com a configuração utilizada pelo projeto.

---

## 1. Clonar o repositório

```bash
git clone <URL-DO-REPOSITORIO>
cd PISemestre4Web
```

Caso esteja trabalhando especificamente com o branch `testing`:

```bash
git checkout testing
```

---

## 2. Preparar o banco de dados

Execute o script SQL correspondente à versão atual da aplicação em um ambiente local de desenvolvimento.

> Verifique o conteúdo do script antes da execução, pois a versão atual recria o banco `easyclinic`.

---

## 3. Configurar a conexão

A conexão do Sequelize está definida no backend.

A configuração atual utiliza:

```text
Banco: easyclinic
Usuário: root
Senha: vazia
Host: localhost
Porta: 3306
Dialect: mysql
```

Caso seu ambiente utilize configurações diferentes, ajuste os dados de conexão antes de iniciar o servidor.

---

## 4. Configurar o JWT

O backend utiliza a variável de ambiente:

```text
CHAVETOKEN
```

Crie um arquivo `.env` dentro da pasta `backend`.

Gere uma chave aleatória localmente:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o valor gerado para o arquivo `backend/.env`:

```env
CHAVETOKEN=cole_aqui_o_valor_gerado
```

O servidor carrega esse arquivo mesmo quando iniciado a partir de outra pasta e não inicia se a variável estiver ausente. Não versione uma chave real de produção no repositório.

---

## 5. Instalar e executar o backend

```bash
cd backend
npm install
npm start
```

O comando `npm start` utiliza o Nodemon para executar o servidor.

A API é iniciada na porta:

```text
5000
```

ou seja:

```text
http://localhost:5000
```

---

## 6. Instalar e executar o front-end

Em outro terminal, volte para a raiz:

```bash
npm install
npm run dev
```

O Vite exibirá no terminal o endereço utilizado pelo servidor de desenvolvimento.

---

# Scripts do front-end

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

| Script    | Função                                    |
| --------- | ----------------------------------------- |
| `dev`     | inicia o servidor de desenvolvimento Vite |
| `build`   | executa o build TypeScript e Vite         |
| `lint`    | executa o ESLint                          |
| `preview` | inicia uma prévia do build gerado         |

---

# Estado atual e limitações

O EasyClinic ainda está em desenvolvimento.

Entre os principais pontos ainda não finalizados estão:

* conteúdo definitivo da página inicial;
* integração completa da agenda com a autenticação;
* isolamento dos agendamentos por clínica;
* gerenciamento completo do ciclo de vida das consultas;
* controle de conflito de horários;
* integração integral entre a implementação atual e todos os RF, RN e RNF;
* adaptação do backend às melhorias previstas na modelagem futura.

O cadastro inicial também é executado atualmente em duas operações independentes, e não em uma única transação.

---

# Equipe

| Integrante                     |       RA |
| ------------------------------ | -------: |
| Augusto Barreto Gomes Alves    |  2500011 |
| Mateus Graçadio Coelho         | 25000217 |
| Pedro Henrique Breda Domingues | 25000578 |
| Felipe Grossi Pereira          | 25000473 |
| João Vitor Zamai Martins       | 25000783 |
| Augusto De Pauli Duarte        | 25000087 |

---

## Projeto Integrado

**EasyClinic — Sistema de Gerenciamento Clínico**

Projeto Integrado — 4º semestre — Módulo de Aplicação Web.
