import React, { useEffect, useState } from "react";

function ListaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("funcionarios") || "[]");
    setFuncionarios(data);
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>Funcionários Cadastrados</h2>
      <ul>
        {funcionarios.map((f, idx) => (
          <li key={idx}>
            <strong>{f.nome}</strong> - CPF: {f.cpf} - Perfil: {f.perfil}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaFuncionarios;
