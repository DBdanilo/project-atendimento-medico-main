import React, { useState, useEffect } from "react";

const perfis = [
  "Atendente",
  "Médico",
  "Técnico de Enfermagem",
  "Gestor",
];

const initialState = {
  nome: "",
  cpf: "",
  perfil: perfis[0],
};

import "./funcionario.css";

function Funcionario() {
  const [funcionario, setFuncionario] = useState(initialState);
  const [mensagem, setMensagem] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("funcionarios") || "[]");
    setFuncionarios(data);
  }, []);

  const handleChange = (e) => {
    setFuncionario({ ...funcionario, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novosFuncionarios = [...funcionarios, funcionario];
    setFuncionarios(novosFuncionarios);
    localStorage.setItem("funcionarios", JSON.stringify(novosFuncionarios));
    setMensagem("Funcionário cadastrado com sucesso!");
    setFuncionario(initialState);
  };

  return (
  <div className="container-funcionario">
      <h2>Cadastro de Funcionário</h2>
      <form onSubmit={handleSubmit} className="form-funcionario">
        <div>
          <label>Nome:</label>
          <input
            name="nome"
            value={funcionario.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>CPF:</label>
          <input
            name="cpf"
            value={funcionario.cpf}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Perfil:</label>
          <select
            name="perfil"
            value={funcionario.perfil}
            onChange={handleChange}
          >
            {perfis.map((perfil) => (
              <option key={perfil} value={perfil}>
                {perfil}
              </option>
            ))}
          </select>
        </div>
  <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
      <hr />
      <h2>Funcionários Cadastrados</h2>
      <ul className="lista-funcionarios">
        {funcionarios.map((f, idx) => (
          <li key={idx}>
            <strong>{f.nome}</strong> - CPF: {f.cpf} - Perfil: {f.perfil}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Funcionario;
