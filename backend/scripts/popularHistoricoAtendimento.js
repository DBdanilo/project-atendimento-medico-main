// Script para popular a tabela HistoricoAtendimento com base nas triagens e atendimentos existentes
// Executar com: node scripts/popularHistoricoAtendimento.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pacientes = await prisma.paciente.findMany({ include: { triagens: true, atendimentos: true } });
  let count = 0;

  for (const paciente of pacientes) {
    // Para cada triagem do paciente, cria um histórico
    for (const triagem of paciente.triagens) {
      await prisma.historicoAtendimento.create({
        data: {
          pacienteId: paciente.id,
          triagemId: triagem.id,
          funcionarioId: triagem.funcionarioId,
          temperatura: triagem.temperatura,
          pressao: triagem.pressao,
          peso: triagem.peso,
          altura: triagem.altura,
          observacaoTriagem: triagem.observacao,
          prioridadeTriagem: triagem.prioridade,
          descricao: 'Histórico gerado a partir da triagem',
          dataEvento: triagem.createdAt,
        }
      });
      count++;
    }
    // Para cada atendimento do paciente, cria um histórico
    for (const atendimento of paciente.atendimentos) {
      await prisma.historicoAtendimento.create({
        data: {
          pacienteId: paciente.id,
          atendimentoId: atendimento.id,
          funcionarioId: atendimento.funcionarioId,
          motivo: atendimento.motivo,
          diagnostico: atendimento.diagnostico,
          prescricao: atendimento.prescricao,
          observacaoAtendimento: atendimento.observacao,
          prioridadeAtendimento: atendimento.prioridade,
          descricao: 'Histórico gerado a partir do atendimento',
          dataEvento: atendimento.createdAt,
        }
      });
      count++;
    }
  }
  console.log(`População de historicoAtendimento concluída! Registros criados: ${count}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
