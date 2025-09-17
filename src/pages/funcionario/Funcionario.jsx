import React, { useState, useEffect } from "react";
import { getFuncionarios } from '../../utils/api';
import CadastroFuncionario from './CadastroFuncionario';
import "./funcionario.css";

function Funcionario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [erro, setErro] = useState("");
  const [atualizar, setAtualizar] = useState(false);

  useEffect(() => {
    async function fetchFuncionarios() {
      try {
        const data = await getFuncionarios();
        setFuncionarios(data);
      } catch (err) {
        setErro("Erro ao buscar funcionários");
      }
    }
    fetchFuncionarios();
  }, [atualizar]);

  // Função para ser chamada após cadastro
  const onCadastrado = () => setAtualizar(a => !a);

  const [buscaCpf, setBuscaCpf] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [cpfBuscado, setCpfBuscado] = useState("");

  async function handleBuscar(e) {
    e.preventDefault();
    setErro("");
    setBuscando(true);
    try {
      // Remove pontos e traço do CPF antes de buscar
      const cpfBusca = buscaCpf.replace(/\D/g, "");
      setCpfBuscado(cpfBusca);
      const data = await getFuncionarios();
      const filtrados = data.filter(f => (f.cpf || "").replace(/\D/g, "") === cpfBusca);
      setFuncionarios(filtrados.length ? filtrados : []);
      if (!filtrados.length) setErro("Funcionário não encontrado.");
    } catch (err) {
      setErro("Erro ao buscar funcionários");
    }
    setBuscando(false);
  }

  function handleLogout() {
    localStorage.removeItem('usuarioId');
    window.location.href = '/login';
  }

  // Busca nome e perfil do funcionário logado pelo id do localStorage
  const [dadosLogado, setDadosLogado] = useState({ nome: '', perfil: '' });
  useEffect(() => {
    const id = localStorage.getItem('usuarioId');
    if (id) {
      getFuncionarios().then(funcs => {
        const logado = funcs.find(f => String(f.id) === String(id));
        if (logado) setDadosLogado({ nome: logado.nome, perfil: logado.perfil });
      });
    }
  }, []);

  return (
    <div className="container-funcionario">
      {/* Cabeçalho removido conforme solicitado */}
      <div className="funcionario-content">
        <div className="funcionario-form-section">
          <CadastroFuncionario onCadastrado={onCadastrado} semIcone />
          <form className="form-funcionario-busca" onSubmit={handleBuscar} autoComplete="off">
            <input
              type="text"
              placeholder="Buscar por CPF (apenas números)"
              value={buscaCpf}
              onChange={e => setBuscaCpf(e.target.value.replace(/\D/g, ''))}
              className="form-funcionario-input cpf-busca-input"
              maxLength={11}
              required
              style={{ color: '#1976d2', borderColor: '#1976d2', fontWeight: 600 }}
            />
            <button className="form-btn" type="submit" disabled={buscando}>{buscando ? 'Buscando...' : 'Buscar'}</button>
          </form>
        </div>
        <div className="funcionario-list-section">
          <h2>Funcionários Cadastrados</h2>
          {erro && <div className="form-error">{erro}</div>}
          {cpfBuscado ? (
            <ul className="lista-funcionarios">
              {funcionarios.length === 0 && !erro && (
                <li className="funcionario-card vazio">Nenhum funcionário encontrado.</li>
              )}
              {funcionarios
                .filter(f => (f.cpf || '').replace(/\D/g, '') === cpfBuscado)
                .map((f) => (
                  <li key={f.id} className="funcionario-card">
                    <div className="funcionario-card-nome"><b>{f.nome}</b></div>
                    <div className="funcionario-card-cpf">CPF: <span>{f.cpf}</span></div>
                    <div className="funcionario-card-perfil">
                      Perfil: 
                      <select
                        value={f.perfil}
                        onChange={async (e) => {
                          const novoPerfil = e.target.value;
                          try {
                            const { atualizarFuncionario } = await import('../../utils/api');
                            await atualizarFuncionario(f.id, { ...f, perfil: novoPerfil });
                            setAtualizar(a => !a);
                          } catch (err) {
                            alert('Erro ao atualizar perfil!');
                          }
                        }}
                        style={{ marginLeft: '0.5em', padding: '0.2em 0.7em', borderRadius: '6px', border: '1px solid #1976d2', background: '#fafdff', color: '#1976d2', fontWeight: 600 }}
                      >
                        <option value="ATENDENTE">Atendente</option>
                        <option value="MEDICO">Médico</option>
                        <option value="TECNICO_ENFERMAGEM">Técnico de Enfermagem</option>
                        <option value="GESTOR">Gestor</option>
                      </select>
                    </div>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Funcionario;
