// Script para popular HistoricoAtendimento combinando triagem e atendimento do mesmo paciente
// Executar com: node scripts/popularHistoricoAtendimentoCombinado.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pacientes = await prisma.paciente.findMany({
    include: {
      triagens: true,
      atendimentos: true
    }
  });
  let count = 0;

  for (const paciente of pacientes) {
    // Para cada triagem, busca o atendimento mais próximo (após a triagem)
    for (const triagem of paciente.triagens) {
      // Filtra atendimentos do paciente após a triagem
      const atendimentosRelacionados = paciente.atendimentos.filter(a => a.createdAt >= triagem.createdAt);
      // Pega o atendimento mais próximo
      const atendimento = atendimentosRelacionados.sort((a, b) => a.createdAt - b.createdAt)[0];
      await prisma.historicoAtendimento.create({
        data: {
          pacienteId: paciente.id,
          triagemId: triagem.id,
          atendimentoId: atendimento ? atendimento.id : null,
          funcionarioId: atendimento ? atendimento.funcionarioId : triagem.funcionarioId,
          // Dados da triagem
          temperatura: triagem.temperatura,
          pressao: triagem.pressao,
          peso: triagem.peso,
          altura: triagem.altura,
          observacaoTriagem: triagem.observacao,
          prioridadeTriagem: triagem.prioridade,
          // Dados do atendimento
          motivo: atendimento ? atendimento.motivo : null,
          diagnostico: atendimento ? atendimento.diagnostico : null,
          prescricao: atendimento ? atendimento.prescricao : null,
          observacaoAtendimento: atendimento ? atendimento.observacao : null,
          prioridadeAtendimento: atendimento ? atendimento.prioridade : null,
          descricao: atendimento ? 'Histórico combinado triagem + atendimento' : 'Histórico apenas triagem',
          dataEvento: atendimento ? atendimento.createdAt : triagem.createdAt,
        }
      });
      count++;
    }
  }
  console.log(`População de historicoAtendimento combinada concluída! Registros criados: ${count}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
