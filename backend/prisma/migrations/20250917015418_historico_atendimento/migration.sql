-- CreateTable
CREATE TABLE "public"."HistoricoAtendimento" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "triagemId" TEXT,
    "atendimentoId" TEXT,
    "funcionarioId" TEXT,
    "temperatura" DOUBLE PRECISION,
    "pressao" TEXT,
    "peso" DOUBLE PRECISION,
    "altura" DOUBLE PRECISION,
    "observacaoTriagem" TEXT,
    "prioridadeTriagem" TEXT,
    "motivo" TEXT,
    "diagnostico" TEXT,
    "prescricao" TEXT,
    "observacaoAtendimento" TEXT,
    "prioridadeAtendimento" TEXT,
    "descricao" TEXT,
    "dataEvento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoAtendimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."HistoricoAtendimento" ADD CONSTRAINT "HistoricoAtendimento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoricoAtendimento" ADD CONSTRAINT "HistoricoAtendimento_triagemId_fkey" FOREIGN KEY ("triagemId") REFERENCES "public"."Triagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoricoAtendimento" ADD CONSTRAINT "HistoricoAtendimento_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "public"."Atendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoricoAtendimento" ADD CONSTRAINT "HistoricoAtendimento_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "public"."Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
