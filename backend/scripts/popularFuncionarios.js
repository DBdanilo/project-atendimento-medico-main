// Script para popular a tabela Funcionario com dados reais

// Executar com: node popularFuncionarios.jsconst { PrismaClient } = require('@prisma/client');

const bcrypt = require('bcryptjs');

const { PrismaClient } = require('@prisma/client');const faker = require('faker-br');

const prisma = new PrismaClient();const prisma = new PrismaClient();



async function main() {function gerarFuncionarios() {

  const funcionarios = [  const funcionarios = [];

    {  // 2 Médicos

      nome: 'Ana Paula Souza',  for (let i = 0; i < 2; i++) {

      cpf: '12345678901',    funcionarios.push({

      perfil: 'ATENDENTE',      nome: faker.name.findName(),

      senha: '123456',      cpf: faker.br.cpf(),

    },      senha: '123456',

    {      perfil: 'MEDICO'

      nome: 'Carlos Eduardo Silva',    });

      cpf: '23456789012',  }

      perfil: 'TECNICO_ENFERMAGEM',  // 1 Técnico de Enfermagem

      senha: '123456',  funcionarios.push({

    },    nome: faker.name.findName(),

    {    cpf: faker.br.cpf(),

      nome: 'Fernanda Oliveira',    senha: '123456',

      cpf: '34567890123',    perfil: 'TECNICO_ENFERMAGEM'

      perfil: 'TECNICO_ENFERMAGEM',  });

      senha: '123456',  // 1 Atendente

    },  funcionarios.push({

    {    nome: faker.name.findName(),

      nome: 'Dr. Rafael Martins',    cpf: faker.br.cpf(),

      cpf: '45678901234',    senha: '123456',

      perfil: 'MEDICO',    perfil: 'ATENDENTE'

      senha: '123456',  });

    },  return funcionarios;

    {}

      nome: 'Dra. Juliana Costa',

      cpf: '56789012345',

      perfil: 'MEDICO',// Usuário principal com acesso total

      senha: '123456',const userPrincipal = {

    },  nome: 'Danilo',

  ];  cpf: '99999999999',

  senha: '123456',

  for (const f of funcionarios) {  perfil: 'GESTOR'

    await prisma.funcionario.create({};

      data: {

        nome: f.nome,const funcionarios = [userPrincipal, ...gerarFuncionarios()];

        cpf: f.cpf,

        perfil: f.perfil,async function main() {

        senha: f.senha, // O backend já faz o hash ao cadastrar  // Limpa todos os funcionários

      },  await prisma.funcionario.deleteMany({});

    });  // Insere gestor Danilo

    console.log(`Funcionário ${f.nome} criado.`);  const f = userPrincipal;

  }  await prisma.funcionario.create({

}    data: {

      nome: f.nome,

main()      cpf: f.cpf,

  .catch(e => console.error(e))      senha: bcrypt.hashSync(f.senha, 10),

  .finally(() => prisma.$disconnect());      perfil: f.perfil

    }
  });
  console.log(`Funcionario inserido: ${f.nome} (${f.perfil})`);

  // Insere 2 médicos
  for (let i = 0; i < 2; i++) {
    const nome = faker.name.findName();
    const cpf = faker.br.cpf();
    await prisma.funcionario.create({
      data: {
        nome,
        cpf,
        senha: bcrypt.hashSync('123456', 10),
        perfil: 'MEDICO'
      }
    });
    console.log(`Funcionario inserido: ${nome} (MEDICO)`);
  }
  // Insere 1 técnico de enfermagem
  const nomeTec = faker.name.findName();
  const cpfTec = faker.br.cpf();
  await prisma.funcionario.create({
    data: {
      nome: nomeTec,
      cpf: cpfTec,
      senha: bcrypt.hashSync('123456', 10),
      perfil: 'TECNICO_ENFERMAGEM'
    }
  });
  console.log(`Funcionario inserido: ${nomeTec} (TECNICO_ENFERMAGEM)`);
  // Insere 1 atendente
  const nomeAt = faker.name.findName();
  const cpfAt = faker.br.cpf();
  await prisma.funcionario.create({
    data: {
      nome: nomeAt,
      cpf: cpfAt,
      senha: bcrypt.hashSync('123456', 10),
      perfil: 'ATENDENTE'
    }
  });
  console.log(`Funcionario inserido: ${nomeAt} (ATENDENTE)`);
  console.log('Funcionários inseridos com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
