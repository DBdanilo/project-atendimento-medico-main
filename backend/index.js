// ================== IMPORTS E INICIALIZAÇÃO ==================
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

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
        triagem: true,
        atendimento: true
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

app.use(cors());
app.use(express.json());

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
    const paciente = await prisma.paciente.create({
      data: { nome, cpf, dataNascimento, sexo, endereco, telefone, prioridade, listaEsperaTriagem: !!listaEsperaTriagem }
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
    if (sexo !== undefined) data.sexo = sexo;
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
