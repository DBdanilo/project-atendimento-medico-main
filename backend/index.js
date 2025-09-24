// ================== IMPORTS E INICIALIZAÇÃO ==================
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint de teste
app.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

// Endpoint de verificação de dados
app.get('/status-dados', async (req, res) => {
  try {
    const [pacientes, funcionarios, triagens, atendimentos] = await Promise.all([
      prisma.paciente.count(),
      prisma.funcionario.count(), 
      prisma.triagem.count(),
      prisma.atendimento.count()
    ]);
    
    res.json({
      status: 'ok',
      dados: {
        pacientes,
        funcionarios,
        triagens,
        atendimentos,
        total: pacientes + funcionarios + triagens + atendimentos
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar dados', details: error.message });
  }
});

// Rota para buscar prontuário eletrônico por CPF
app.get('/api/prontuario', async (req, res) => {
  try {
    const cpfBusca = (req.query.cpf || '').replace(/\D/g, '');
    // Busca paciente pelo CPF
    const paciente = await prisma.paciente.findFirst({ where: { cpf: cpfBusca } });
    if (!paciente) return res.status(404).json([]);
    // Busca histórico de atendimento do paciente
    const historico = await prisma.historicoAtendimento.findMany({
      where: { pacienteId: paciente.id },
      orderBy: { dataEvento: 'desc' },
      include: {
        triagem: {
          include: {
            funcionario: {
              select: { nome: true, perfil: true }
            }
          }
        },
        atendimento: {
          include: {
            funcionario: {
              select: { nome: true, perfil: true }
            }
          }
        },
        funcionario: {
          select: { nome: true, perfil: true }
        }
      }
    });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar prontuário', details: err.message });
  }
});

// Buscar paciente por CPF
app.get('/pacientes/cpf/:cpf', async (req, res) => {
  try {
    // Remove pontos e traço do CPF buscado
    const cpfBusca = req.params.cpf.replace(/\D/g, '');
    console.log('--- Busca de paciente por CPF ---');
    console.log('CPF recebido:', req.params.cpf);
    console.log('CPF normalizado:', cpfBusca);
    // Busca todos os pacientes e compara CPF sem formatação
    const pacientes = await prisma.paciente.findMany();
    console.log('CPFs no banco:', pacientes.map(p => p.cpf));
    const paciente = pacientes.find(p => (p.cpf || '').replace(/\D/g, '') === cpfBusca);
    if (!paciente) {
      console.log('Paciente não encontrado para o CPF:', cpfBusca);
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    console.log('Paciente encontrado:', paciente);
    res.json(paciente);
  } catch (err) {
    console.error('Erro ao buscar paciente por CPF:', err);
    res.status(500).json({ error: 'Erro ao buscar paciente por CPF' });
  }
});
const JWT_SECRET = process.env.JWT_SECRET;

// ================== ROTAS ==================

// Rota Painel de Situação
app.get('/painel', async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: {
        triagem: true,
        atendimento: true
      }
    });
    const situacoes = {
      aguardando_triagem: 0,
      em_triagem: 0,
      aguardando_atendimento: 0,
      em_atendimento: 0,
      finalizados: 0
    };
    for (const p of pacientes) {
      if (p.atendimento) {
        situacoes.finalizados++;
      } else if (p.triagem && !p.atendimento) {
        situacoes.aguardando_atendimento++;
      } else if (p.emAtendimento) {
        situacoes.em_atendimento++;
      } else if (p.emTriagem) {
        situacoes.em_triagem++;
      } else {
        situacoes.aguardando_triagem++;
      }
    }
    res.json(situacoes);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar painel' });
  }
});
// (Bloco removido: estava fora de rota/função e causava erro de await fora de async)
// Rotas de Atendimento (CRUD)
app.post('/atendimentos', async (req, res) => {
  try {
    const { pacienteId, funcionarioId, motivo, diagnostico, prescricao, observacao, prioridade } = req.body;
    if (!pacienteId || !funcionarioId || !motivo || !diagnostico || !prescricao || !prioridade) {
      return res.status(400).json({ error: 'Dados obrigatórios' });
    }
    const atendimento = await prisma.atendimento.create({
      data: {
        pacienteId,
        funcionarioId,
        motivo,
        diagnostico,
        prescricao,
        observacao: observacao || null,
        prioridade
      }
    });

    // --- Lógica para preencher HistoricoAtendimento com dados detalhados ---
    // Busca a triagem mais recente do paciente
    const triagem = await prisma.triagem.findFirst({
      where: { pacienteId },
      orderBy: { createdAt: 'desc' }
    });
    // Busca dados detalhados do atendimento recém-criado
    const atendimentoDetalhado = await prisma.atendimento.findUnique({ where: { id: atendimento.id } });
    if (triagem) {
      // Tenta encontrar um histórico existente só com triagem
      const historicoExistente = await prisma.historicoAtendimento.findFirst({
        where: {
          pacienteId,
          triagemId: triagem.id,
          atendimentoId: null
        }
      });
      if (historicoExistente) {
        await prisma.historicoAtendimento.update({
          where: { id: historicoExistente.id },
          data: {
            atendimentoId: atendimento.id,
            funcionarioId,
            dataEvento: new Date(),
            // Dados detalhados da triagem
            temperatura: triagem.temperatura,
            pressao: triagem.pressao,
            peso: triagem.peso,
            altura: triagem.altura,
            observacaoTriagem: triagem.observacao,
            prioridadeTriagem: triagem.prioridade,
            // Dados detalhados do atendimento
            motivo: atendimentoDetalhado.motivo,
            diagnostico: atendimentoDetalhado.diagnostico,
            prescricao: atendimentoDetalhado.prescricao,
            observacaoAtendimento: atendimentoDetalhado.observacao,
            prioridadeAtendimento: atendimentoDetalhado.prioridade
          }
        });
      } else {
        await prisma.historicoAtendimento.create({
          data: {
            pacienteId,
            triagemId: triagem.id,
            atendimentoId: atendimento.id,
            funcionarioId,
            dataEvento: new Date(),
            // Dados detalhados da triagem
            temperatura: triagem.temperatura,
            pressao: triagem.pressao,
            peso: triagem.peso,
            altura: triagem.altura,
            observacaoTriagem: triagem.observacao,
            prioridadeTriagem: triagem.prioridade,
            // Dados detalhados do atendimento
            motivo: atendimentoDetalhado.motivo,
            diagnostico: atendimentoDetalhado.diagnostico,
            prescricao: atendimentoDetalhado.prescricao,
            observacaoAtendimento: atendimentoDetalhado.observacao,
            prioridadeAtendimento: atendimentoDetalhado.prioridade
          }
        });
      }
    } else {
      // Se não houver triagem, cria histórico só com atendimento
      await prisma.historicoAtendimento.create({
        data: {
          pacienteId,
          atendimentoId: atendimento.id,
          funcionarioId,
          dataEvento: new Date(),
          // Dados detalhados do atendimento
          motivo: atendimentoDetalhado.motivo,
          diagnostico: atendimentoDetalhado.diagnostico,
          prescricao: atendimentoDetalhado.prescricao,
          observacaoAtendimento: atendimentoDetalhado.observacao,
          prioridadeAtendimento: atendimentoDetalhado.prioridade
        }
      });
    }
    // --- Fim da lógica de persistência detalhada ---

    res.status(201).json(atendimento);
  } catch (err) {
    console.error('Erro ao registrar atendimento:', err);
    res.status(500).json({ error: 'Erro ao registrar atendimento' });
  }
});

app.get('/atendimentos', async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany();
    res.json(atendimentos);
  } catch {
    res.status(500).json({ error: 'Erro ao listar atendimentos' });
  }
});
// ================== IMPORTS E INICIALIZAÇÃO ==================

app.get('/atendimentos/:id', async (req, res) => {
  try {
    const atendimento = await prisma.atendimento.findUnique({ where: { id: req.params.id } });
    if (!atendimento) return res.status(404).json({ error: 'Atendimento não encontrado' });
    res.json(atendimento);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar atendimento' });
  }
});

app.put('/atendimentos/:id', async (req, res) => {
  try {
    const { medico, descricao, prioridade } = req.body;
    const atendimento = await prisma.atendimento.update({
      where: { id: req.params.id },
      data: { medico, descricao, prioridade }
    });
    res.json(atendimento);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar atendimento' });
  }
});
// Rotas de Triagem (CRUD)
app.post('/triagens', async (req, res) => {
  try {
    let { pacienteId, funcionarioId, temperatura, pressao, peso, altura, observacao, prioridade } = req.body;
    if (!pacienteId || !prioridade) return res.status(400).json({ error: 'Dados obrigatórios' });
    // Converter para float
    temperatura = parseFloat(temperatura);
    peso = parseFloat(peso);
    altura = parseFloat(altura);
    if (isNaN(temperatura) || isNaN(peso) || isNaN(altura)) {
      return res.status(400).json({ error: 'Temperatura, peso e altura devem ser números válidos.' });
    }
    const data = { pacienteId, temperatura, pressao, peso, altura, observacao, prioridade };
    if (funcionarioId && typeof funcionarioId === 'string' && funcionarioId.trim().length > 0) {
      data.funcionarioId = funcionarioId;
    }
    const triagem = await prisma.triagem.create({ data });
    res.status(201).json(triagem);
  } catch (err) {
    console.error('Erro detalhado ao registrar triagem:', err);
    res.status(500).json({ error: 'Erro ao registrar triagem', details: err.message });
  }
});

app.get('/triagens', async (req, res) => {
  try {
    const triagens = await prisma.triagem.findMany();
    res.json(triagens);
  } catch {
    res.status(500).json({ error: 'Erro ao listar triagens' });
  }
});

app.get('/triagens/:id', async (req, res) => {
  try {
  const triagem = await prisma.triagem.findUnique({ where: { id: req.params.id } });
    if (!triagem) return res.status(404).json({ error: 'Triagem não encontrada' });
    res.json(triagem);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar triagem' });
  }
});

app.put('/triagens/:id', async (req, res) => {
  try {
    const { temperatura, pressao, peso, altura, observacao, prioridade } = req.body;
    const triagem = await prisma.triagem.update({
      where: { id: req.params.id },
      data: { temperatura, pressao, peso, altura, observacao, prioridade }
    });
    res.json(triagem);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar triagem' });
  }
});
// Rota de login
app.post('/login', async (req, res) => {
  const { cpf, senha } = req.body;
  const user = await prisma.funcionario.findUnique({ where: { cpf } });
  if (!user || !bcrypt.compareSync(senha, user.senha)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, nome: user.nome, perfil: user.perfil, id: user.id });
});

// Rotas de Funcionários (CRUD)
app.post('/funcionarios', async (req, res) => {
  try {
    const { nome, cpf, senha, perfil } = req.body;
    if (!nome || !cpf || !senha || !perfil) return res.status(400).json({ error: 'Dados obrigatórios' });
    const hash = bcrypt.hashSync(senha, 10);
    const funcionario = await prisma.funcionario.create({
      data: { nome, cpf, senha: hash, perfil }
    });
    res.status(201).json({ id: funcionario.id, nome: funcionario.nome, cpf: funcionario.cpf, perfil: funcionario.perfil });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'CPF já cadastrado' });
    res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
  }
});

app.get('/funcionarios', async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({ select: { id: true, nome: true, cpf: true, perfil: true } });
    res.json(funcionarios);
  } catch {
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
});

app.get('/funcionarios/:id', async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, nome: true, cpf: true, perfil: true }
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(funcionario);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
});

app.put('/funcionarios/:id', async (req, res) => {
  try {
    const { nome, cpf, senha, perfil } = req.body;
    const data = { nome, cpf, perfil };
    if (senha) data.senha = bcrypt.hashSync(senha, 10);
    const funcionario = await prisma.funcionario.update({
      where: { id: Number(req.params.id) },
      data
    });
    res.json({ id: funcionario.id, nome: funcionario.nome, cpf: funcionario.cpf, perfil: funcionario.perfil });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'CPF já cadastrado' });
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
});


// Rotas de Pacientes (CRUD)
app.post('/pacientes', async (req, res) => {
  try {
    let { nome, cpf, dataNascimento, sexo, endereco, telefone, prioridade, listaEsperaTriagem } = req.body;
    if (!nome || !cpf || !dataNascimento || !sexo) return res.status(400).json({ error: 'Dados obrigatórios' });
    cpf = (cpf || '').replace(/\D/g, '');
    // Normaliza sexo para 'M' ou 'F'
    let sexoPadrao = 'F';
    if (typeof sexo === 'string') {
      const s = sexo.trim().toUpperCase();
      if (s === 'M' || s === 'MASCULINO' || s === 'MASC') sexoPadrao = 'M';
      else if (s === 'F' || s === 'FEMININO' || s === 'FEM') sexoPadrao = 'F';
    }
    const paciente = await prisma.paciente.create({
      data: { nome, cpf, dataNascimento, sexo: sexoPadrao, endereco, telefone, prioridade, listaEsperaTriagem: !!listaEsperaTriagem }
    });
    res.status(201).json(paciente);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'CPF já cadastrado' });
    res.status(500).json({ error: 'Erro ao cadastrar paciente' });
  }
});

app.get('/pacientes', async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: { triagens: true, atendimentos: true }
    });
    res.json(pacientes);
  } catch {
    res.status(500).json({ error: 'Erro ao listar pacientes' });
  }
});

app.get('/pacientes/:id', async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id } });
    if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json(paciente);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
});

app.put('/pacientes/:id', async (req, res) => {
  try {
    let { nome, cpf, dataNascimento, sexo, endereco, telefone, prioridade, listaEsperaTriagem } = req.body;
    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (cpf !== undefined) data.cpf = (cpf || '').replace(/\D/g, '');
    if (dataNascimento !== undefined) data.dataNascimento = dataNascimento;
    if (sexo !== undefined) {
      let sexoPadrao = 'F';
      if (typeof sexo === 'string') {
        const s = sexo.trim().toUpperCase();
        if (s === 'M' || s === 'MASCULINO' || s === 'MASC') sexoPadrao = 'M';
        else if (s === 'F' || s === 'FEMININO' || s === 'FEM') sexoPadrao = 'F';
      }
      data.sexo = sexoPadrao;
    }
    if (endereco !== undefined) data.endereco = endereco;
    if (telefone !== undefined) data.telefone = telefone;
    if (prioridade !== undefined) data.prioridade = prioridade;
    if (listaEsperaTriagem !== undefined) data.listaEsperaTriagem = listaEsperaTriagem;
    const paciente = await prisma.paciente.update({
      where: { id: req.params.id },
      data
    });
    res.json(paciente);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'CPF já cadastrado' });
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
});

app.delete('/pacientes/:id', async (req, res) => {
  try {
    await prisma.paciente.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Erro ao remover paciente' });
  }
});

// ================== RELATÓRIOS GERENCIAIS ==================

// 1. Relatório de Tempo Médio de Atendimento
app.get('/relatorios/tempo-medio', async (req, res) => {
  try {
    // Busca histórico com triagem e atendimento no mesmo registro
    const dados = await prisma.historicoAtendimento.findMany({
      where: {
        AND: [
          { triagemId: { not: null } },
          { atendimentoId: { not: null } }
        ]
      },
      include: {
        triagem: true,
        atendimento: true
      }
    });

    let tempoTotalMinutos = 0;
    let contador = 0;
    const temposPorPrioridade = { BAIXA: [], MEDIA: [], ALTA: [] };

    dados.forEach(item => {
      if (item.triagem && item.atendimento) {
        const tempoTriagem = new Date(item.triagem.createdAt);
        const tempoAtendimento = new Date(item.atendimento.createdAt);
        const diferencaMinutos = (tempoAtendimento - tempoTriagem) / (1000 * 60);
        
        if (diferencaMinutos > 0) {
          tempoTotalMinutos += diferencaMinutos;
          contador++;
          
          const prioridade = item.prioridadeTriagem || item.triagem.prioridade;
          if (temposPorPrioridade[prioridade]) {
            temposPorPrioridade[prioridade].push(diferencaMinutos);
          }
        }
      }
    });

    const tempoMedioGeral = contador > 0 ? Math.round(tempoTotalMinutos / contador) : 0;
    
    const tempoMedioPorPrioridade = {};
    Object.keys(temposPorPrioridade).forEach(prioridade => {
      const tempos = temposPorPrioridade[prioridade];
      tempoMedioPorPrioridade[prioridade] = tempos.length > 0 
        ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
        : 0;
    });

    res.json({
      tempoMedioGeral: `${tempoMedioGeral} minutos`,
      tempoMedioPorPrioridade,
      totalAtendimentos: contador
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de tempo médio', details: err.message });
  }
});

// 2. Relatório de Picos de Demanda por Horário
app.get('/relatorios/picos-demanda', async (req, res) => {
  try {
    const triagens = await prisma.triagem.findMany({
      select: { createdAt: true }
    });
    
    const atendimentos = await prisma.atendimento.findMany({
      select: { createdAt: true }
    });

    const demandaPorHora = {};
    
    // Inicializar todas as horas
    for (let i = 0; i < 24; i++) {
      demandaPorHora[i] = { triagens: 0, atendimentos: 0, total: 0 };
    }

    // Contar triagens por hora
    triagens.forEach(triagem => {
      const hora = new Date(triagem.createdAt).getHours();
      demandaPorHora[hora].triagens++;
      demandaPorHora[hora].total++;
    });

    // Contar atendimentos por hora
    atendimentos.forEach(atendimento => {
      const hora = new Date(atendimento.createdAt).getHours();
      demandaPorHora[hora].atendimentos++;
      demandaPorHora[hora].total++;
    });

    // Encontrar pico
    let picoHora = 0;
    let picoTotal = 0;
    Object.keys(demandaPorHora).forEach(hora => {
      if (demandaPorHora[hora].total > picoTotal) {
        picoTotal = demandaPorHora[hora].total;
        picoHora = parseInt(hora);
      }
    });

    res.json({
      demandaPorHora,
      picoHorario: `${picoHora}:00 - ${picoHora + 1}:00`,
      totalPico: picoTotal
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de picos de demanda', details: err.message });
  }
});

// 3. Análise por Faixa Etária
app.get('/relatorios/faixa-etaria', async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      select: { dataNascimento: true, sexo: true },
      where: {
        OR: [
          { triagens: { some: {} } },
          { atendimentos: { some: {} } }
        ]
      }
    });

    const faixas = {
      'pediatria': { masculino: 0, feminino: 0, total: 0 },      // 0-12
      'adolescente': { masculino: 0, feminino: 0, total: 0 },   // 13-17
      'adulto': { masculino: 0, feminino: 0, total: 0 },        // 18-60
      'idoso': { masculino: 0, feminino: 0, total: 0 }          // 60+
    };

    const hoje = new Date();
    
    pacientes.forEach(paciente => {
      const nascimento = new Date(paciente.dataNascimento);
      const idade = Math.floor((hoje - nascimento) / (1000 * 60 * 60 * 24 * 365.25));
      let faixa;
      if (idade <= 12) faixa = 'pediatria';
      else if (idade <= 17) faixa = 'adolescente';
      else if (idade <= 60) faixa = 'adulto';
      else faixa = 'idoso';

      let sexo = 'feminino';
      if (typeof paciente.sexo === 'string') {
        const s = paciente.sexo.trim().toUpperCase();
        if (s === 'M') sexo = 'masculino';
        else if (s === 'F') sexo = 'feminino';
      }
      faixas[faixa][sexo]++;
      faixas[faixa].total++;
    });

    res.json(faixas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de faixa etária', details: err.message });
  }
});

// 4. Diagnósticos Mais Comuns
app.get('/relatorios/diagnosticos', async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
      select: { diagnostico: true, prioridade: true },
      include: {
        paciente: {
          select: { dataNascimento: true }
        }
      }
    });

    // Top 10 diagnósticos
    const contadorDiagnosticos = {};
    const diagnosticosPorPrioridade = { BAIXA: {}, MEDIA: {}, ALTA: {} };
    const diagnosticosPorFaixa = { pediatria: {}, adolescente: {}, adulto: {}, idoso: {} };

    const hoje = new Date();

    atendimentos.forEach(atendimento => {
      const diagnostico = atendimento.diagnostico;
      
      // Contar total
      contadorDiagnosticos[diagnostico] = (contadorDiagnosticos[diagnostico] || 0) + 1;
      
      // Por prioridade
      const prioridade = atendimento.prioridade;
      if (!diagnosticosPorPrioridade[prioridade][diagnostico]) {
        diagnosticosPorPrioridade[prioridade][diagnostico] = 0;
      }
      diagnosticosPorPrioridade[prioridade][diagnostico]++;

      // Por faixa etária
      if (atendimento.paciente?.dataNascimento) {
        const nascimento = new Date(atendimento.paciente.dataNascimento);
        const idade = Math.floor((hoje - nascimento) / (1000 * 60 * 60 * 24 * 365.25));
        
        let faixa;
        if (idade <= 12) faixa = 'pediatria';
        else if (idade <= 17) faixa = 'adolescente';
        else if (idade <= 60) faixa = 'adulto';
        else faixa = 'idoso';

        if (!diagnosticosPorFaixa[faixa][diagnostico]) {
          diagnosticosPorFaixa[faixa][diagnostico] = 0;
        }
        diagnosticosPorFaixa[faixa][diagnostico]++;
      }
    });

    // Top 10
    const top10 = Object.entries(contadorDiagnosticos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([diagnostico, count]) => ({ diagnostico, count }));

    res.json({
      top10Diagnosticos: top10,
      diagnosticosPorPrioridade,
      diagnosticosPorFaixaEtaria: diagnosticosPorFaixa,
      totalAtendimentos: atendimentos.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de diagnósticos', details: err.message });
  }
});

// 5. Prescrições Mais Utilizadas
app.get('/relatorios/prescricoes', async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
      select: { prescricao: true, diagnostico: true },
      include: {
        funcionario: {
          select: { nome: true }
        }
      }
    });

    const contadorPrescricoes = {};
    const prescricoesPorDiagnostico = {};
    const prescricoesPorMedico = {};

    atendimentos.forEach(atendimento => {
      const prescricao = atendimento.prescricao;
      const diagnostico = atendimento.diagnostico;
      const medico = atendimento.funcionario?.nome || 'Não informado';

      // Contar prescrições mais utilizadas
      contadorPrescricoes[prescricao] = (contadorPrescricoes[prescricao] || 0) + 1;

      // Prescrições por diagnóstico
      if (!prescricoesPorDiagnostico[diagnostico]) {
        prescricoesPorDiagnostico[diagnostico] = {};
      }
      prescricoesPorDiagnostico[diagnostico][prescricao] = 
        (prescricoesPorDiagnostico[diagnostico][prescricao] || 0) + 1;

      // Prescrições por médico
      if (!prescricoesPorMedico[medico]) {
        prescricoesPorMedico[medico] = {};
      }
      prescricoesPorMedico[medico][prescricao] = 
        (prescricoesPorMedico[medico][prescricao] || 0) + 1;
    });

    // Top 10 prescrições
    const top10Prescricoes = Object.entries(contadorPrescricoes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([prescricao, count]) => ({ prescricao, count }));

    res.json({
      top10Prescricoes,
      prescricoesPorDiagnostico,
      prescricoesPorMedico,
      totalPrescricoes: atendimentos.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de prescrições', details: err.message });
  }
});

// =================== ENDPOINT CONSOLIDADO PARA DASHBOARD ===================
// Endpoint otimizado que retorna todos os relatórios de uma vez
app.get('/relatorios/dashboard', async (req, res) => {
  try {
    console.log('Gerando dashboard consolidado...');
    
    // Buscar todos os dados necessários em paralelo
    const [historicoCompleto, triagens, atendimentos, pacientes] = await Promise.all([
      prisma.historicoAtendimento.findMany({
        where: {
          AND: [
            { triagemId: { not: null } },
            { atendimentoId: { not: null } }
          ]
        },
        include: {
          triagem: true,
          atendimento: true
        }
      }),
      prisma.triagem.findMany({
        select: { createdAt: true, prioridade: true }
      }),
      prisma.atendimento.findMany({
        select: { 
          createdAt: true, 
          diagnostico: true, 
          prescricao: true,
          funcionario: { select: { nome: true } }
        }
      }),
      prisma.paciente.findMany({
        select: { dataNascimento: true, sexo: true },
        where: {
          OR: [
            { triagens: { some: {} } },
            { atendimentos: { some: {} } }
          ]
        }
      })
    ]);

    // ========== PROCESSAMENTO TEMPO MÉDIO ==========
    let tempoTotalMinutos = 0;
    let contador = 0;
    const temposPorPrioridade = { BAIXA: [], MEDIA: [], ALTA: [] };

    historicoCompleto.forEach(item => {
      if (item.triagem && item.atendimento) {
        const tempoTriagem = new Date(item.triagem.createdAt);
        const tempoAtendimento = new Date(item.atendimento.createdAt);
        const diferencaMinutos = (tempoAtendimento - tempoTriagem) / (1000 * 60);
        
        if (diferencaMinutos > 0) {
          tempoTotalMinutos += diferencaMinutos;
          contador++;
          
          const prioridade = item.prioridadeTriagem || item.triagem.prioridade;
          if (temposPorPrioridade[prioridade]) {
            temposPorPrioridade[prioridade].push(diferencaMinutos);
          }
        }
      }
    });

    const tempoMedioGeral = contador > 0 ? Math.round(tempoTotalMinutos / contador) : 0;
    const tempoMedioPorPrioridade = {};
    Object.keys(temposPorPrioridade).forEach(prioridade => {
      const tempos = temposPorPrioridade[prioridade];
      tempoMedioPorPrioridade[prioridade] = tempos.length > 0 
        ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
        : 0;
    });

    // ========== PROCESSAMENTO PICOS DE DEMANDA ==========
    const demandaPorHora = {};
    for (let i = 0; i < 24; i++) {
      demandaPorHora[i] = { triagens: 0, atendimentos: 0, total: 0 };
    }

    triagens.forEach(triagem => {
      const hora = new Date(triagem.createdAt).getHours();
      demandaPorHora[hora].triagens++;
      demandaPorHora[hora].total++;
    });

    atendimentos.forEach(atendimento => {
      const hora = new Date(atendimento.createdAt).getHours();
      demandaPorHora[hora].atendimentos++;
      demandaPorHora[hora].total++;
    });

    let picoHora = 0;
    let picoTotal = 0;
    Object.keys(demandaPorHora).forEach(hora => {
      if (demandaPorHora[hora].total > picoTotal) {
        picoTotal = demandaPorHora[hora].total;
        picoHora = parseInt(hora);
      }
    });

    // ========== PROCESSAMENTO FAIXA ETÁRIA ==========
    const faixas = {
      'pediatria': { masculino: 0, feminino: 0, total: 0 },
      'adolescente': { masculino: 0, feminino: 0, total: 0 },
      'adulto': { masculino: 0, feminino: 0, total: 0 },
      'idoso': { masculino: 0, feminino: 0, total: 0 }
    };

    const hoje = new Date();
    
    pacientes.forEach(paciente => {
      const nascimento = new Date(paciente.dataNascimento);
      const idade = Math.floor((hoje - nascimento) / (1000 * 60 * 60 * 24 * 365.25));
      
      let faixa;
      if (idade <= 12) faixa = 'pediatria';
      else if (idade <= 17) faixa = 'adolescente';
      else if (idade <= 60) faixa = 'adulto';
      else faixa = 'idoso';

      if (typeof paciente.sexo === 'string') {
        const s = paciente.sexo.trim().toUpperCase();
        if (s === 'M') faixas[faixa].masculino++;
        else if (s === 'F') faixas[faixa].feminino++;
      }
      faixas[faixa].total++;
    });

    // ========== PROCESSAMENTO DIAGNÓSTICOS ==========
    const diagnosticos = {};
    atendimentos.forEach(atendimento => {
      if (atendimento.diagnostico && atendimento.diagnostico.trim()) {
        const diag = atendimento.diagnostico.trim();
        diagnosticos[diag] = (diagnosticos[diag] || 0) + 1;
      }
    });

    const top10Diagnosticos = Object.entries(diagnosticos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([diagnostico, count]) => ({ diagnostico, count }));

    // ========== PROCESSAMENTO PRESCRIÇÕES ==========
    const prescricoes = {};
    atendimentos.forEach(atendimento => {
      if (atendimento.prescricao && atendimento.prescricao.trim()) {
        const presc = atendimento.prescricao.trim();
        prescricoes[presc] = (prescricoes[presc] || 0) + 1;
      }
    });

    const top10Prescricoes = Object.entries(prescricoes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([prescricao, count]) => ({ prescricao, count }));

    // ========== RESPOSTA CONSOLIDADA ==========
    const dashboard = {
      ultimaAtualizacao: new Date().toISOString(),
      tempoMedio: {
        tempoMedioGeral: `${tempoMedioGeral} minutos`,
        tempoMedioPorPrioridade,
        totalAtendimentos: contador
      },
      picosDemanda: {
        demandaPorHora,
        picoHorario: `${picoHora}:00 - ${picoHora + 1}:00`,
        totalPico: picoTotal
      },
      faixaEtaria: faixas,
      diagnosticos: {
        top10Diagnosticos,
        totalAtendimentos: atendimentos.length
      },
      prescricoes: {
        top10Prescricoes,
        totalPrescricoes: atendimentos.length
      }
    };

    res.json(dashboard);
  } catch (err) {
    console.error('Erro ao gerar dashboard:', err);
    res.status(500).json({ error: 'Erro ao gerar dashboard consolidado', details: err.message });
  }
});

// Exemplo de rota protegida
app.get('/protegido', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token não enviado' });

  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    res.json({ ok: true, usuario: decoded });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

app.listen(3001, () => console.log('Backend rodando na porta 3001'));
