
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
      const cpfLimpo = cpf.replace(/\D/g, ''); // Remove formatação do CPF
      const res = await fetch(`/api/prontuario?cpf=${cpfLimpo}`);
      if (!res.ok) throw new Error("Erro ao buscar prontuário");
      const data = await res.json();
      console.log('Dados recebidos:', data); // Debug
      setHistorico(data);
      if (data.length === 0) setErro("Nenhum histórico encontrado para este CPF.");
    } catch (err) {
      console.error('Erro ao buscar prontuário:', err); // Debug
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
                    {item.observacaoTriagem && <span> - Obs: {item.observacaoTriagem}</span>}
                  </div>
                )}
                {item.atendimentoId && (
                  <div>
                    <b>Atendimento:</b> Motivo: {item.motivo ?? '-'}, Diagnóstico: {item.diagnostico ?? '-'}, Prescrição: {item.prescricao ?? '-'}, Prioridade: {item.prioridadeAtendimento ?? '-'}
                    {item.observacaoAtendimento && <span> - Obs: {item.observacaoAtendimento}</span>}
                  </div>
                )}
                {item.descricao && <div><b>Descrição:</b> {item.descricao}</div>}
                {/* Dados do triagem e atendimento originais se disponíveis */}
                {item.triagem && (
                  <div style={{marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '5px'}}>
                    <b>Dados da Triagem Original:</b><br/>
                    Temp: {item.triagem.temperatura}°C, Pressão: {item.triagem.pressao}, 
                    Peso: {item.triagem.peso}kg, Altura: {item.triagem.altura}m, 
                    Prioridade: {item.triagem.prioridade}
                    {item.triagem.observacao && <div>Observação: {item.triagem.observacao}</div>}
                  </div>
                )}
                {item.atendimento && (
                  <div style={{marginTop: '10px', padding: '10px', background: '#e8f4fd', borderRadius: '5px'}}>
                    <b>Dados do Atendimento Original:</b><br/>
                    Motivo: {item.atendimento.motivo}, Diagnóstico: {item.atendimento.diagnostico}, 
                    Prescrição: {item.atendimento.prescricao}, Prioridade: {item.atendimento.prioridade}
                    {item.atendimento.observacao && <div>Observação: {item.atendimento.observacao}</div>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProntuarioEletronico;
