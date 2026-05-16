# TicketFlow Front

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

Front-end do sistema **TicketFlow**, uma aplicação web para abertura e acompanhamento de chamados internos de TI.

## Sobre o projeto

O **TicketFlow** surgiu para resolver a falta de padronização na abertura de tickets de suporte, evitando perda de informações e tornando a triagem mais rápida e organizada.

No front-end, a proposta é fornecer uma interface simples e funcional para:

- abertura de chamados por usuários comuns;
- visualização e gerenciamento de tickets;
- painel para técnicos acompanharem a fila;
- exibição do status e prioridade dos chamados.

## Contexto do sistema

### Problema
Em muitos cenários de help desk interno, os chamados são abertos sem padrão, com informações incompletas e sem organização adequada, o que gera lentidão no atendimento.

### Solução
Uma aplicação web com formulário padronizado para abertura de tickets e uma interface para acompanhamento e resolução dos chamados.

## Arquitetura

Este repositório representa apenas o **front-end** do sistema.

A arquitetura geral do projeto foi pensada da seguinte forma:

- **Front-end:** baseado em componentes;
- **Back-end:** Python;
- **Banco de dados:** MySQL;
- **Modelo arquitetural:** Cliente-Servidor.

## Tecnologias utilizadas

- **Vite**
- **React**
- **JavaScript**
- **CSS**

## Funcionalidades previstas no front-end

- [x] Estrutura inicial do projeto
- [ ] Tela de abertura de chamado
- [ ] Formulário padronizado de ticket
- [x] Listagem de chamados
- [x] Painel do técnico
- [x] Exibição de status do ticket
- [x] Indicadores visuais de SLA
- [ ] Integração com a API do back-end

## Como executar o projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/)
- npm ou yarn

### Instalação

```bash
git clone https://github.com/joaosant05/TicketFlow-front.git
cd TicketFlow-front
npm install
npm run dev
