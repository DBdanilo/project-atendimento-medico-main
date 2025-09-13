import React, { useState } from "react";
import { criarFuncionario } from '../../utils/api';

const perfis = [
  { label: "Atendente", value: "ATENDENTE" },
  { label: "Médico", value: "MEDICO" },
  { label: "Técnico de Enfermagem", value: "TECNICO_ENFERMAGEM" },
  { label: "Gestor", value: "GESTOR" },
];

const initialState = {
  nome: "",
  cpf: "",
  perfil: perfis[0].value,
  senha: ""
};


function CadastroFuncionario({ onCadastrado }) {
  const [funcionario, setFuncionario] = useState(initialState);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setFuncionario({ ...funcionario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    try {
      await criarFuncionario(funcionario);
      setMensagem("Funcionário cadastrado com sucesso!");
      setFuncionario(initialState);
      if (onCadastrado) onCadastrado();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErro(err.response.data.error);
      } else {
        setErro("Erro ao cadastrar funcionário");
      }
    }
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
              <option key={perfil.value} value={perfil.value}>
                {perfil.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Senha:</label>
          <input
            name="senha"
            type="password"
            value={funcionario.senha}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>Cadastrar</button>
      </form>
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

export default CadastroFuncionario;