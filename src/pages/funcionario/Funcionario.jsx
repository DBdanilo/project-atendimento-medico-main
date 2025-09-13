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

  return (
    <div className="container-funcionario">
      <CadastroFuncionario onCadastrado={onCadastrado} />
      <hr />
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
