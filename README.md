c:\project-atendimento-medico

# Hospital Atendimento Web System

Sistema completo para gerenciamento do fluxo de atendimento hospitalar, com frontend em React e backend Node.js/Express/Prisma/PostgreSQL.

## Visão Geral

Este projeto organiza e facilita o fluxo de pacientes em ambiente hospitalar, desde o cadastro até o atendimento, triagem, relatórios e dashboards, com foco em usabilidade, segurança e gestão eficiente.

## Funcionalidades Principais

- **Cadastro de Pacientes**: Registro e edição de pacientes com dados completos.
- **Triagem**: Registro de sinais vitais, observações e classificação de prioridade.
- **Atendimento Médico**: Registro detalhado do atendimento, diagnóstico e prescrição.
- **Painel de Situação**: Visualização em tempo real do status dos pacientes.
- **Prontuário Eletrônico**: Histórico completo de triagens e atendimentos por paciente.
- **Relatórios Gerenciais**: Relatórios de tempo médio, picos de demanda, faixa etária, diagnósticos e prescrições.
- **Dashboards**: Indicadores visuais e estatísticas consolidadas.
- **Exportação para PDF**: Relatórios exportáveis usando jsPDF.
- **Autenticação de Funcionários**: Login seguro para médicos, técnicos, atendentes e gestores.
- **Responsividade**: Layout adaptado para desktop, tablet e mobile.

## Arquitetura do Projeto

```
project-atendimento-medico-main/
│
├── backend/
│   ├── index.js            # API Express, rotas, autenticação, relatórios
│   ├── prisma/
│   │   ├── schema.prisma   # Modelos do banco de dados
│   │   └── migrations/     # Migrações do banco
│   └── ...
├── src/
│   ├── assets/             # Imagens e ícones
│   ├── components/         # Componentes globais (Header, Nav, etc.)
│   ├── hooks/              # Hooks customizados
│   ├── pages/              # Páginas principais (cadastro, triagem, atendimento, painel, relatórios, prontuário)
│   ├── utils/              # Funções utilitárias e API frontend
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Ponto de entrada
├── public/                 # Arquivos estáticos
├── package.json            # Dependências e scripts
├── vite.config.js          # Configuração do Vite
└── README.md               # Este arquivo
```

## Tecnologias Utilizadas

- **Frontend:** React, Vite, jsPDF, jspdf-autotable, CSS modularizado
- **Backend:** Node.js, Express, Prisma ORM, JWT, bcryptjs, dotenv
- **Banco de Dados:** PostgreSQL

## Fluxo de Funcionamento

1. **Cadastro:** Paciente é cadastrado pelo atendente.
2. **Triagem:** Técnico registra sinais vitais, prioridade e observações.
3. **Atendimento:** Médico visualiza dados e registra diagnóstico/prescrição.
4. **Prontuário:** Todo histórico fica disponível para consulta.
5. **Relatórios/Dashboards:** Gestor acessa indicadores e exporta relatórios em PDF.

## Como Executar o Projeto

### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL

### 2. Configuração do Banco
1. Configure o arquivo `.env` em `backend/` com sua string de conexão PostgreSQL:
   ```
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/seubanco
   JWT_SECRET=sua_chave_secreta
   ```
2. Rode as migrações:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### 3. Instalação das Dependências
```bash
cd backend && npm install
cd ../ && npm install
```

### 4. Execução
- **Backend:**
  ```bash
  cd backend
  node index.js
  ```
- **Frontend:**
  ```bash
  npm run dev
  ```

### 5. Acesso
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Diferenciais do Projeto

- Estrutura modular e escalável
- Segurança com autenticação JWT e hash de senha
- Relatórios e dashboards completos (tempo médio, picos, diagnósticos, prescrições)
- Exportação de relatórios em PDF (jsPDF)
- Prontuário eletrônico integrado
- Código limpo, componentizado e documentado

## Contato

Dúvidas, sugestões ou contribuições? Abra uma issue ou entre em contato com o responsável pelo projeto.
