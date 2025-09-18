// Mapeamento de permissões por perfil
export const permissoes = {
  GESTOR: [
    'home', 'cadastro', 'triagem', 'atendimento', 'painel', 'funcionarios', 'relatorio', 'prontuario'
  ],
  MEDICO: [
    'home', 'atendimento', 'prontuario'
  ],
  TECNICO_ENFERMAGEM: [
    'home', 'triagem'
  ],
  ATENDENTE: [
    'home', 'cadastro', 'painel'
  ]
};

export function temPermissao(perfil, modulo) {
  if (!perfil || !modulo) return false;
  const mods = permissoes[perfil];
  if (!mods) return false;
  return mods.includes(modulo);
}
