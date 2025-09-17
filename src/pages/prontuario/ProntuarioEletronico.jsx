
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
      
      // Agrupar dados por data
      const dadosAgrupados = agruparPorData(data);
      setHistorico(dadosAgrupados);
      if (data.length === 0) setErro("Nenhum histórico encontrado para este CPF.");
    } catch (err) {
      console.error('Erro ao buscar prontuário:', err); // Debug
      setErro(err.message);
    }
    setLoading(false);
  }

  function agruparPorData(dados) {
    const grupos = {};
    dados.forEach(item => {
      const data = new Date(item.dataEvento).toLocaleDateString('pt-BR');
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(item);
    });
    
    // Converter para array ordenado por data (mais recente primeiro)
    return Object.keys(grupos)
      .sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')))
      .map(data => ({
        data,
        eventos: grupos[data].sort((a, b) => new Date(b.dataEvento) - new Date(a.dataEvento))
      }));
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
          {historico.map((grupo) => (
            <div key={grupo.data} className="historico-dia">
              <div className="data-cabecalho">
                <h4>{grupo.data}</h4>
                <span className="total-eventos">{grupo.eventos.length} evento(s)</span>
              </div>
              <div className="eventos-container">
                {grupo.eventos.map((item) => (
                  <div key={item.id} className="prontuario-item">
                    <div className="horario">
                      <strong>{new Date(item.dataEvento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                    
                    {item.triagemId && (
                      <div className="secao-triagem">
                        <div className="titulo-secao">
                          <span className="icone-triagem">🩺</span>
                          <strong>Triagem</strong>
                          {(item.triagem?.funcionario?.nome || item.funcionario?.nome) && (
                            <span className="nome-profissional">
                              - {item.triagem?.funcionario?.nome || item.funcionario?.nome}
                            </span>
                          )}
                        </div>
                        <div className="dados-grid">
                          <span><strong>Temperatura:</strong> {item.temperatura ?? '-'}°C</span>
                          <span><strong>Pressão:</strong> {item.pressao ?? '-'}</span>
                          <span><strong>Peso:</strong> {item.peso ?? '-'}kg</span>
                          <span><strong>Altura:</strong> {item.altura ?? '-'}m</span>
                          <span><strong>Prioridade:</strong> <span className={`prioridade ${item.prioridadeTriagem?.toLowerCase()}`}>{item.prioridadeTriagem ?? '-'}</span></span>
                        </div>
                        {item.observacaoTriagem && (
                          <div className="observacao">
                            <strong>Observação:</strong> {item.observacaoTriagem}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.atendimentoId && (
                      <div className="secao-atendimento">
                        <div className="titulo-secao">
                          <span className="icone-atendimento">👨‍⚕️</span>
                          <strong>Atendimento</strong>
                          {item.atendimento?.funcionario?.nome && (
                            <span className="nome-profissional">
                              - Dr(a). {item.atendimento.funcionario.nome}
                            </span>
                          )}
                        </div>
                        <div className="dados-verticais">
                          <div><strong>Motivo:</strong> {item.motivo ?? '-'}</div>
                          <div><strong>Diagnóstico:</strong> {item.diagnostico ?? '-'}</div>
                          <div><strong>Prescrição:</strong> {item.prescricao ?? '-'}</div>
                          <div><strong>Prioridade:</strong> <span className={`prioridade ${item.prioridadeAtendimento?.toLowerCase()}`}>{item.prioridadeAtendimento ?? '-'}</span></div>
                        </div>
                        {item.observacaoAtendimento && (
                          <div className="observacao">
                            <strong>Observação:</strong> {item.observacaoAtendimento}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.descricao && !item.descricao.includes('Histórico combinado') && !item.descricao.includes('Histórico gerado') && (
                      <div className="descricao-evento">
                        <strong>Descrição:</strong> {item.descricao}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProntuarioEletronico;
