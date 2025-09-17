
import React, { useState } from "react";
import './prontuario.css';

function ProntuarioEletronico() {
  const [cpf, setCpf] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function buscarProntuario(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setHistorico([]);
    try {
      const res = await fetch(`/api/prontuario?cpf=${cpf}`);
      if (!res.ok) throw new Error("Erro ao buscar prontuário");
      const data = await res.json();
      setHistorico(data);
      if (data.length === 0) setErro("Nenhum histórico encontrado para este CPF.");
    } catch (err) {
      setErro(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="prontuario-container">
      <h2>Prontuário Eletrônico</h2>
      <form onSubmit={buscarProntuario} className="prontuario-form">
        <input
          type="text"
          placeholder="Digite o CPF do paciente"
          value={cpf}
          onChange={e => setCpf(e.target.value)}
          className="prontuario-cpf-input"
        />
        <button type="submit" className="btn-principal" disabled={loading}>Buscar</button>
      </form>
      {loading && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}
      {historico.length > 0 && (
        <div className="prontuario-historico">
          <h3>Histórico de Atendimento</h3>
          <ul>
            {historico.map((item) => (
              <li key={item.id} className="prontuario-item">
                <div><b>Data:</b> {item.dataEvento ? new Date(item.dataEvento).toLocaleString() : '-'}</div>
                {item.triagemId && (
                  <div>
                    <b>Triagem:</b> Temp: {item.temperatura ?? '-'}°C, Pressão: {item.pressao ?? '-'}, Peso: {item.peso ?? '-'}kg, Altura: {item.altura ?? '-'}m, Prioridade: {item.prioridadeTriagem ?? '-'}
                  </div>
                )}
                {item.atendimentoId && (
                  <div>
                    <b>Atendimento:</b> Motivo: {item.motivo ?? '-'}, Diagnóstico: {item.diagnostico ?? '-'}, Prescrição: {item.prescricao ?? '-'}, Prioridade: {item.prioridadeAtendimento ?? '-'}
                  </div>
                )}
                {item.descricao && <div><b>Descrição:</b> {item.descricao}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProntuarioEletronico;
