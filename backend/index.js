const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Rota de login
app.post('/login', async (req, res) => {
  const { cpf, senha } = req.body;
  const user = await prisma.funcionario.findUnique({ where: { cpf } });

  if (!user || !bcrypt.compareSync(senha, user.senha)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, nome: user.nome, perfil: user.perfil });
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
