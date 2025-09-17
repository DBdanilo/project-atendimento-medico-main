// Script para popular triagem e atendimento conforme regras
// Executar com: node scripts/popularTriagemAtendimento.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const faker = require('faker-br');
// Utilitários para número e float aleatórios
function randNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max, precision = 0.01) {
  return Math.round((Math.random() * (max - min) + min) / precision) * precision;
}
function arrayElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addMinutes(date, min, max) {
  const minutes = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Date(date.getTime() + minutes * 60000);
}

async function main() {
  const pacientes = await prisma.paciente.findMany();
  const tecnicos = await prisma.funcionario.findMany({ where: { perfil: 'TECNICO_ENFERMAGEM' } });
  const medicos = await prisma.funcionario.findMany({ where: { perfil: 'MEDICO' } });

  if (pacientes.length === 0 || tecnicos.length === 0 || medicos.length === 0) {
    console.error('É necessário ter pacientes, técnicos e médicos cadastrados.');
    return;
  }

  const triagens = [];
  const atendimentos = [];
  const dataInicio = new Date('2024-01-01T08:00:00');
  const dataFim = new Date();

  // Garantir pelo menos um registro por paciente
  for (const paciente of pacientes) {
  const tecnico = arrayElement(tecnicos);
  const medico = arrayElement(medicos);
    // Gera data de triagem entre 08:00 e 18:00
    const dia = randomDate(dataInicio, dataFim);
    dia.setHours(8, 0, 0, 0);
  const horaTriagem = randNumber(0, 600); // minutos após 08:00
    const dataTriagem = new Date(dia.getTime() + horaTriagem * 60000);
  const intervalo = randNumber(30, 180); // minutos entre triagem e atendimento
    const dataAtendimento = new Date(dataTriagem.getTime() + intervalo * 60000);

    // Dados realistas para relatório
    const sintomas = ['Febre', 'Dor de cabeça', 'Tosse', 'Cansaço', 'Dor abdominal', 'Náusea', 'Dores musculares'];
    const motivos = ['Avaliação clínica', 'Reavaliação', 'Emergência', 'Consulta de rotina', 'Retorno'];
    const diagnosticos = ['Infecção viral', 'Gripe', 'Covid-19', 'Gastrite', 'Enxaqueca', 'Sinusite', 'Hipertensão'];
    const prescricoes = ['Dipirona', 'Paracetamol', 'Ibuprofeno', 'Repouso', 'Hidratação', 'Antibiótico', 'Exames complementares'];

    const triagem = await prisma.triagem.create({
      data: {
        pacienteId: paciente.id,
        funcionarioId: tecnico.id,
  temperatura: randFloat(36, 39, 0.1),
  pressao: `${randNumber(10, 14)}/${randNumber(6, 9)}`,
  peso: randFloat(50, 120, 0.1),
  altura: randFloat(1.5, 2.0, 0.01),
        observacao: faker.random.arrayElement(sintomas),
        prioridade: faker.random.arrayElement(['BAIXA', 'MEDIA', 'ALTA']),
        createdAt: dataTriagem,
      }
    });
    await prisma.atendimento.create({
      data: {
        pacienteId: paciente.id,
        funcionarioId: medico.id,
        motivo: faker.random.arrayElement(motivos),
        diagnostico: faker.random.arrayElement(diagnosticos),
        prescricao: faker.random.arrayElement(prescricoes),
        observacao: faker.lorem.sentence(),
        prioridade: triagem.prioridade,
        createdAt: dataAtendimento,
      }
    });
  }

  // Gerar registros aleatórios até 500 em cada tabela
  for (let i = 0; i < 500 - pacientes.length; i++) {
    const paciente = faker.random.arrayElement(pacientes);
    const tecnico = faker.random.arrayElement(tecnicos);
    const medico = faker.random.arrayElement(medicos);
    // Gera data de triagem entre 08:00 e 18:00
    const dia = randomDate(dataInicio, dataFim);
    dia.setHours(8, 0, 0, 0);
  const horaTriagem = faker.random.number({ min: 0, max: 600 }); // minutos após 08:00
    const dataTriagem = new Date(dia.getTime() + horaTriagem * 60000);
  const intervalo = faker.random.number({ min: 30, max: 180 }); // minutos entre triagem e atendimento
    const dataAtendimento = new Date(dataTriagem.getTime() + intervalo * 60000);

    // Dados realistas para relatório
    const sintomas = ['Febre', 'Dor de cabeça', 'Tosse', 'Cansaço', 'Dor abdominal', 'Náusea', 'Dores musculares'];
    const motivos = ['Avaliação clínica', 'Reavaliação', 'Emergência', 'Consulta de rotina', 'Retorno'];
    const diagnosticos = ['Infecção viral', 'Gripe', 'Covid-19', 'Gastrite', 'Enxaqueca', 'Sinusite', 'Hipertensão'];
    const prescricoes = ['Dipirona', 'Paracetamol', 'Ibuprofeno', 'Repouso', 'Hidratação', 'Antibiótico', 'Exames complementares'];

    const triagem = await prisma.triagem.create({
      data: {
        pacienteId: paciente.id,
        funcionarioId: tecnico.id,
  temperatura: faker.random.float({ min: 36, max: 39, precision: 0.1 }),
  pressao: `${faker.random.number({ min: 10, max: 14 })}/${faker.random.number({ min: 6, max: 9 })}`,
  peso: faker.random.float({ min: 50, max: 120, precision: 0.1 }),
  altura: faker.random.float({ min: 1.5, max: 2.0, precision: 0.01 }),
  observacao: arrayElement(sintomas),
  prioridade: arrayElement(['BAIXA', 'MEDIA', 'ALTA']),
        createdAt: dataTriagem,
      }
    });
    await prisma.atendimento.create({
      data: {
        pacienteId: paciente.id,
        funcionarioId: medico.id,
  motivo: arrayElement(motivos),
  diagnostico: arrayElement(diagnosticos),
  prescricao: arrayElement(prescricoes),
        observacao: faker.lorem.sentence(),
        prioridade: triagem.prioridade,
        createdAt: dataAtendimento,
      }
    });
  }

  console.log('População de triagem e atendimento concluída!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
