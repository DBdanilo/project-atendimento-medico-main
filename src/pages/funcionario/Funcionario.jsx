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

  async function handleBuscar(e) {
    e.preventDefault();
    setErro("");
    setBuscando(true);
    try {
      // Remove pontos e traço do CPF antes de buscar
      const cpfBusca = buscaCpf.replace(/\D/g, "");
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
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.7rem'}}>
        <div style={{fontWeight:600,fontSize:'1.08rem',color:'#1976d2'}}>
          Funcionário: {dadosLogado.nome || 'Não identificado'} <span style={{color:'#444',fontWeight:400}}>| Perfil: {dadosLogado.perfil || 'Não identificado'}</span>
        </div>
        <button className="form-btn" onClick={handleLogout}>Sair</button>
      </div>
      <CadastroFuncionario onCadastrado={onCadastrado} />
      <hr />
      <form onSubmit={handleBuscar} style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'1.5rem',justifyContent:'center'}}>
        <input
          type="text"
          placeholder="Buscar por CPF"
          value={buscaCpf}
          onChange={e => setBuscaCpf(e.target.value)}
          style={{width:'180px',padding:'0.5em',borderRadius:4,border:'1px solid #bbb'}}
        />
        <button className="form-btn" type="submit" disabled={buscando}>Buscar</button>
      </form>
      <h2>Funcionários Cadastrados</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <ul className="lista-funcionarios">
        {funcionarios.map((f) => (
          <li key={f.id}>
            <strong>{f.nome}</strong> - CPF: {f.cpf} - Perfil: {f.perfil}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Funcionario;
