// Script para popular a tabela Paciente com 100 registros
// Executar com: node scripts/popularPacientes.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const faker = require('faker-br');

async function main() {
  for (let i = 0; i < 100; i++) {
    const nome = faker.name.findName();
    const cpf = faker.br.cpf();
    const dataNascimento = faker.date.between('1940-01-01', '2020-01-01');
    const sexo = faker.random.arrayElement(['M', 'F']);
    const endereco = faker.address.streetAddress();
    const telefone = faker.phone.phoneNumber('(##) #####-####');
    const prioridade = faker.random.arrayElement(['BAIXA', 'MEDIA', 'ALTA']);
    try {
      await prisma.paciente.create({
        data: {
          nome,
          cpf: cpf.replace(/\D/g, ''),
          dataNascimento,
          sexo,
          endereco,
          telefone,
          prioridade,
        },
      });
      console.log(`Paciente ${nome} criado.`);
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`CPF ${cpf} já cadastrado.`);
      } else {
        console.error(`Erro ao criar ${nome}:`, e.message);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
