// Script para popular a tabela Funcionario com dados reais
// Executar com: node scripts/popularFuncionarios.js


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const funcionarios = [
    {
      nome: 'Ana Paula Souza',
      cpf: '12345678901',
      perfil: 'ATENDENTE',
      senha: '123456',
    },
    {
      nome: 'Carlos Eduardo Silva',
      cpf: '23456789012',
      perfil: 'TECNICO_ENFERMAGEM',
      senha: '123456',
    },
    {
      nome: 'Fernanda Oliveira',
      cpf: '34567890123',
      perfil: 'TECNICO_ENFERMAGEM',
      senha: '123456',
    },
    {
      nome: 'Dr. Rafael Martins',
      cpf: '45678901234',
      perfil: 'MEDICO',
      senha: '123456',
    },
    {
      nome: 'Dra. Juliana Costa',
      cpf: '56789012345',
      perfil: 'MEDICO',
      senha: '123456',
    },
  ];

  for (const f of funcionarios) {
    try {
      const hash = bcrypt.hashSync(f.senha, 10);
      await prisma.funcionario.create({
        data: {
          nome: f.nome,
          cpf: f.cpf,
          perfil: f.perfil,
          senha: hash, // Senha já com hash para login JWT
        },
      });
      console.log(`Funcionário ${f.nome} criado.`);
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`CPF ${f.cpf} já cadastrado.`);
      } else {
        console.error(`Erro ao criar ${f.nome}:`, e.message);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());