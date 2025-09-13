// Script para popular a tabela de pacientes com 100 registros do arquivo pacientesAleatorios.json
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../../src/utils/pacientesAleatorios.json');
  // Função para gerar CPF válido
  function gerarCPF() {
    function rand(n) { return Math.floor(Math.random() * n); }
    let n = [];
    for (let i = 0; i < 9; i++) n.push(rand(10));
    // Calcula dígitos verificadores
    let d1 = n.reduce((acc, v, i) => acc + v * (10 - i), 0);
    d1 = 11 - (d1 % 11); if (d1 >= 10) d1 = 0;
    let d2 = n.reduce((acc, v, i) => acc + v * (11 - i), 0) + d1 * 2;
    d2 = 11 - (d2 % 11); if (d2 >= 10) d2 = 0;
    return n.join('') + d1 + d2;
  }

  // Funções utilitárias para gerar dados
  const nomes = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduarda', 'Fernando', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karen', 'Luís', 'Mariana', 'Nelson', 'Olívia', 'Pedro', 'Quitéria', 'Rafael', 'Sofia', 'Thiago', 'Úrsula', 'Vitor', 'Walkiria', 'Xavier', 'Yara', 'Zeca'];
  const sobrenomes = ['Silva', 'Souza', 'Costa', 'Oliveira', 'Pereira', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Barbosa', 'Ribeiro', 'Dias', 'Teixeira', 'Moreira'];
  const prioridades = ['Normal', 'Moderado', 'Urgente'];
  const sexos = ['Feminino', 'Masculino'];

  const cpfsGerados = new Set();
  let inseridos = 0;
  while (inseridos < 100) {
    let cpf;
    do { cpf = gerarCPF(); } while (cpfsGerados.has(cpf));
    cpfsGerados.add(cpf);
    const nome = nomes[Math.floor(Math.random() * nomes.length)] + ' ' + sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    const dataNascimento = new Date(1970 + Math.floor(Math.random() * 35), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const endereco = `Rua ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}, ${Math.floor(Math.random() * 9999)}, Centro, Cidade - UF, 00000-000`;
    const telefone = `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const prioridade = prioridades[Math.floor(Math.random() * prioridades.length)];
    const sexo = sexos[Math.floor(Math.random() * sexos.length)];
    try {
      await prisma.paciente.create({
        data: {
          nome,
          cpf,
          dataNascimento,
          endereco,
          telefone,
          prioridade,
          sexo,
        }
      });
      inseridos++;
    } catch (e) {
      if (e.code === 'P2002') continue;
      else console.error('Erro ao inserir paciente:', nome, e);
    }
  }
  console.log(`${inseridos} pacientes aleatórios únicos inseridos com sucesso!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
