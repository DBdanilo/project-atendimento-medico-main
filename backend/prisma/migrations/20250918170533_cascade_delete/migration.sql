-- DropForeignKey
ALTER TABLE "public"."Atendimento" DROP CONSTRAINT "Atendimento_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HistoricoAtendimento" DROP CONSTRAINT "HistoricoAtendimento_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Triagem" DROP CONSTRAINT "Triagem_pacienteId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Triagem" ADD CONSTRAINT "Triagem_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Atendimento" ADD CONSTRAINT "Atendimento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoricoAtendimento" ADD CONSTRAINT "HistoricoAtendimento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
