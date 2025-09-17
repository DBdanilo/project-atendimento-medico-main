import React, { useState } from "react";
import { criarFuncionario } from '../../utils/api';
import "./funcionario.css";

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
    <div className="form-funcionario-card">
      <form className="form-funcionario" onSubmit={handleSubmit} autoComplete="off">
        <div className="form-funcionario-header">
          <h2>Cadastro de Funcionário</h2>
        </div>
        <div className="form-group">
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            name="nome"
            value={funcionario.nome}
            onChange={handleChange}
            required
            placeholder="Digite o nome"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            name="cpf"
            value={funcionario.cpf}
            onChange={handleChange}
            required
            placeholder="Digite o CPF"
            maxLength={14}
          />
        </div>
        <div className="form-group">
          <label htmlFor="perfil">Perfil</label>
          <select
            id="perfil"
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
        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            name="senha"
            type="password"
            value={funcionario.senha}
            onChange={handleChange}
            required
            placeholder="Digite a senha"
          />
        </div>
        <button className="form-btn" type="submit">Cadastrar</button>
        {mensagem && <div className="form-success">{mensagem}</div>}
        {erro && <div className="form-error">{erro}</div>}
      </form>
    </div>
  );
}

export default CadastroFuncionario;