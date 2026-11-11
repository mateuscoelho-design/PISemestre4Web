
# Backlog do Projeto — EasyClinic

**Projeto Integrado — 4º semestre | Grupo 7**  
**Sistema:** EasyClinic — Gerenciamento Clínico

---

## Visão geral

O EasyClinic é um sistema web desenvolvido para auxiliar na organização administrativa de clínicas e consultórios. O projeto foi pensado para o Consultório Dr. Márcio Magalhães Paiva, de São José do Rio Pardo/SP.

A proposta é reunir, em um mesmo lugar, os dados da clínica, dos usuários, dos pacientes, dos profissionais e dos agendamentos. Dessa forma, a rotina de cadastro e consulta de informações fica mais organizada.

A aplicação utiliza React e TypeScript na interface, Node.js e Express na API e Sequelize com MySQL para o armazenamento dos dados. O acesso utiliza autenticação com JWT.

Este backlog reúne as funcionalidades já iniciadas e as melhorias previstas nos documentos de requisitos.

### Classificação das funcionalidades

- **Parcialmente implementado:** já existe uma base no sistema, mas ainda faltam ajustes ou requisitos.
- **Previsto:** está definido nos requisitos, mas ainda não está completamente disponível na aplicação.

---

## ÉPICO 01 — Cadastro inicial da clínica

**Objetivo:** Permitir o cadastro da clínica e do primeiro usuário responsável pelo sistema.

O cadastro deve receber nome e CNPJ da clínica, além de nome, e-mail e senha do primeiro usuário master. Também está prevista a criação inicial de uma tag Geral e de um plano Particular.

**Estado:** Parcialmente implementado.

**Pendente:** Reunir a criação dos registros em uma única transação, evitando cadastros incompletos caso ocorra alguma falha.

**Referência:** RF01 e RF02.

---

## ÉPICO 02 — Login e controle de usuários

**Objetivo:** Controlar o acesso dos usuários às funções administrativas do EasyClinic.

O sistema possui login com e-mail e senha e emissão de token JWT. O projeto prevê os perfis master e atendente, com permissões diferentes.

**Estado:** Parcialmente implementado.

**Pendente:** Completar a verificação de permissões nas rotas, o controle de usuários ativos, a revogação de sessões e as regras de manutenção dos colaboradores.

**Referência:** RF03, RF04, RF08 e RF09.

---

## ÉPICO 03 — Recuperação de senha e edição do perfil

**Objetivo:** Permitir que os usuários atualizem suas informações e recuperem o acesso à conta.

Estão previstos a edição de nome, e-mail e senha, além da recuperação de senha por um link enviado ao e-mail cadastrado.

**Estado:** Parcialmente implementado / previsto.

**Pendente:** Completar o fluxo de recuperação, as confirmações de segurança e a invalidação de sessões após a alteração das credenciais.

**Referência:** RF05, RF06 e RF07.

---

## ÉPICO 04 — Gerenciamento de pacientes

**Objetivo:** Cadastrar e consultar os pacientes atendidos pela clínica.

O cadastro de pacientes inclui nome, CPF, e-mail, telefone, complemento, tag e plano. A aplicação já possui formulário, listagem e pesquisa de pacientes.

**Estado:** Parcialmente implementado.

**Pendente:** Completar as validações, a paginação, os filtros por situação e o processo de inativação e reativação.

**Referência:** RF10 a RF13.

---

## ÉPICO 05 — Gerenciamento de profissionais

**Objetivo:** Organizar os profissionais vinculados a cada clínica.

O sistema já possui cadastro e listagem de profissionais, incluindo nome, especialidade e documento profissional.

**Estado:** Parcialmente implementado.

**Pendente:** Completar as validações dos documentos, os filtros, a paginação e as regras de inativação dos profissionais.

**Referência:** RF14 a RF16.

---

## ÉPICO 06 — Tags e planos

**Objetivo:** Permitir a classificação administrativa dos pacientes e a associação de planos.

A aplicação possui estrutura para cadastrar, consultar e manter tags e planos, utilizados no cadastro de pacientes.

**Estado:** Parcialmente implementado.

**Pendente:** Validar as regras de desconto, impedir associações a registros inativos e garantir que tags e planos pertençam à clínica correta.

**Referência:** RF17 e RF18.

---

## ÉPICO 07 — Visualização da agenda

**Objetivo:** Mostrar os agendamentos de forma simples e organizada.

O EasyClinic utiliza o FullCalendar para apresentar a agenda semanal, permitindo a visualização dos horários e das consultas cadastradas.

**Estado:** Parcialmente implementado.

**Pendente:** Filtrar os agendamentos pela clínica autenticada e completar os detalhes, os filtros e a indicação da situação de cada consulta.

**Referência:** RF20, RF21 e RF24.

---

## ÉPICO 08 — Cadastro de agendamentos

**Objetivo:** Permitir a criação de consultas para pacientes e profissionais cadastrados.

O sistema já possui um fluxo básico de agendamento, associando data e hora, paciente, profissional e clínica.

**Estado:** Parcialmente implementado.

**Pendente:** Proteger as rotas da agenda, registrar início e término das consultas e impedir conflitos de horários.

**Referência:** RF19.

---

## ÉPICO 09 — Acompanhamento das consultas

**Objetivo:** Permitir alterações nos agendamentos durante a rotina da clínica.

O sistema deverá permitir reagendar consultas e controlar suas situações: agendada, confirmada, realizada ou cancelada.

**Estado:** Previsto.

**Pendente:** Implementar reagendamento, cancelamento, confirmação, conclusão e regras de transição entre as situações.

**Referência:** RF22 e RF23.

---

## ÉPICO 10 — Segurança e integridade dos dados

**Objetivo:** Proteger os dados administrativos e impedir acessos indevidos.

A aplicação utiliza JWT e possui validações em parte da API. Os requisitos também definem controle de permissões, proteção de senhas e isolamento das informações entre clínicas.

**Estado:** Parcialmente implementado.

**Pendente:** Padronizar a autenticação em todas as rotas administrativas, revisar as validações e aplicar as melhorias previstas para o banco de dados.

**Referência:** RN01 a RN04; RNF01 a RNF05 e RNF10.

---

## ÉPICO 11 — Interface e experiência de uso

**Objetivo:** Facilitar a navegação e o preenchimento das informações pelos usuários.

A interface foi desenvolvida com React, TypeScript e Tailwind CSS, reunindo telas de acesso, cadastros, listagens e agenda.

**Estado:** Parcialmente implementado.

**Pendente:** Completar a integração das telas, melhorar as mensagens de validação e verificar a adaptação a diferentes tamanhos de tela.

**Referência:** RNF07 e RNF08.

---

## ÉPICO 12 — Testes e preparação para publicação

**Objetivo:** Preparar o sistema para utilização fora do ambiente local.

A arquitetura separa a interface web, a API e o banco de dados. O projeto prevê configurações por ambiente, testes, proteção dos dados e procedimentos de recuperação.

**Estado:** Previsto / em preparação.

**Pendente:** Revisar as configurações do banco e da API, realizar os testes de funcionamento e segurança e preparar o ambiente de hospedagem.

**Referência:** RNF06 e RNF09 a RNF12.

---

## Prioridades para a evolução

1. **Agenda:** corrigir a autenticação, o isolamento por clínica e validar conflitos de horário.
2. **Consultas:** implementar reagendamento, cancelamento e controle das situações.
3. **Segurança:** completar as permissões e validações nas rotas.
4. **Cadastros:** concluir as regras de manutenção de pacientes, profissionais, colaboradores, tags e planos.
5. **Entrega:** testar os fluxos principais e preparar a publicação do sistema.

---

## Documentos de referência

- [README do EasyClinic](../README.md)
- [Requisitos Funcionais](rf.md)
- [Regras de Negócio](rn.md)
- [Requisitos Não Funcionais](rnf.md)
