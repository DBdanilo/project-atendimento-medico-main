// Buscar paciente por CPF
export const getPacientePorCpf = (cpf) => api.get(`/pacientes/cpf/${cpf}`).then(res => res.data);
import axios from 'axios';

const api = axios.create({});

// Pacientes
export const getPacientes = () => api.get('/pacientes').then(res => res.data);
export const getPaciente = (id) => api.get(`/pacientes/${id}`).then(res => res.data);
export const criarPaciente = (paciente) => api.post('/pacientes', paciente).then(res => res.data);
export const atualizarPaciente = (id, paciente) => api.put(`/pacientes/${id}`, paciente).then(res => res.data);
export const deletarPaciente = (id) => api.delete(`/pacientes/${id}`);

// Funcionários
export const getFuncionarios = () => api.get('/funcionarios').then(res => res.data);
export const criarFuncionario = (funcionario) => api.post('/funcionarios', funcionario).then(res => res.data);

// Login
export const login = (cpf, senha) => api.post('/login', { cpf, senha }).then(res => res.data);

// Triagem
export const criarTriagem = (triagem) => api.post('/triagens', triagem).then(res => res.data);
export const atualizarTriagem = (id, triagem) => api.put(`/triagens/${id}`, triagem).then(res => res.data);

// Atendimento
export const criarAtendimento = (atendimento) => api.post('/atendimentos', atendimento).then(res => res.data);
export const atualizarAtendimento = (id, atendimento) => api.put(`/atendimentos/${id}`, atendimento).then(res => res.data);

// Relatórios
export const getRelatorioAtendimentos = () => api.get('/relatorios/atendimentos').then(res => res.data);

// Painel
export const getPainel = () => api.get('/painel').then(res => res.data);

export default api;
