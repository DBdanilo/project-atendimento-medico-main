import React, { useState } from "react";

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

function CadastroFuncionario() {
  const [funcionario, setFuncionario] = useState(initialState);
  const [mensagem, setMensagem] = useState("");

  const handleChange = (e) => {
    setFuncionario({ ...funcionario, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const funcionarios = JSON.parse(localStorage.getItem("funcionarios") || "[]");
    funcionarios.push(funcionario);
    localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
    setMensagem("Funcionário cadastrado com sucesso!");
    setFuncionario(initialState);
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Cadastro de Funcionário</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" style={{ marginTop: 10 }}>Cadastrar</button>
      </form>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
    </div>
  );
}

export default CadastroFuncionario;
