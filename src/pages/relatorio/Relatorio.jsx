import React, { useState } from "react";
import "./Relatorio.css";

// Funções de exportação
function exportarJSON(dados, nomeArquivo) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${nomeArquivo}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportarCSV(dados, nomeArquivo, tipo) {
  let csv = '';
  
  switch(tipo) {
    case 'tempo-medio':
      csv = 'Métrica,Valor\n';
      csv += `Tempo Médio Geral,${dados.tempoMedioGeral}\n`;
      csv += `Total Atendimentos,${dados.totalAtendimentos}\n`;
      csv += '\nPrioridade,Tempo Médio (min)\n';
      Object.entries(dados.tempoMedioPorPrioridade).forEach(([prioridade, tempo]) => {
        csv += `${prioridade},${tempo}\n`;
      });
      break;
      
    case 'faixa-etaria':
      csv = 'Faixa Etária,Masculino,Feminino,Total\n';
      Object.entries(dados).forEach(([faixa, dados]) => {
        csv += `${faixa},${dados.masculino},${dados.feminino},${dados.total}\n`;
      });
      break;
      
    case 'diagnosticos':
      csv = 'Diagnóstico,Quantidade\n';
      dados.top10Diagnosticos.forEach(item => {
        csv += `${item.diagnostico},${item.count}\n`;
      });
      break;
      
    case 'prescricoes':
      csv = 'Prescrição,Quantidade\n';
      dados.top10Prescricoes.forEach(item => {
        csv += `${item.prescricao},${item.count}\n`;
      });
      break;
      
    case 'picos-demanda':
      csv = 'Hora,Triagens,Atendimentos,Total\n';
      Object.entries(dados.demandaPorHora).forEach(([hora, dados]) => {
        csv += `${hora}:00,${dados.triagens},${dados.atendimentos},${dados.total}\n`;
      });
      break;
  }
  
  const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${nomeArquivo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Relatorio() {
  const [relatorios, setRelatorios] = useState({
    tempoMedio: null,
    faixaEtaria: null,
    diagnosticos: null,
    prescricoes: null,
    picosDemanda: null
  });
  const [loading, setLoading] = useState({});
  const [erro, setErro] = useState({});

  const buscarRelatorio = async (tipo) => {
    setLoading(prev => ({ ...prev, [tipo]: true }));
    setErro(prev => ({ ...prev, [tipo]: '' }));
    
    try {
      const response = await fetch(`/relatorios/${tipo}`);
      if (!response.ok) throw new Error(`Erro ao buscar relatório: ${response.statusText}`);
      const dados = await response.json();
      setRelatorios(prev => ({ ...prev, [tipo]: dados }));
    } catch (err) {
      console.error(`Erro no relatório ${tipo}:`, err);
      setErro(prev => ({ ...prev, [tipo]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [tipo]: false }));
    }
  };

  return (
    <div className="container-relatorio">
      <h2>Relatórios Gerenciais</h2>
      
      {/* Relatório de Tempo Médio */}
      <div className="relatorio-secao">
        <div className="relatorio-header">
          <h3>1. Tempo Médio de Atendimento</h3>
          <div className="botoes-relatorio">
            <button 
              onClick={() => buscarRelatorio('tempo-medio')} 
              className="btn-relatorio btn-buscar"
              disabled={loading['tempo-medio']}
            >
              {loading['tempo-medio'] ? 'Carregando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
        
        {erro['tempo-medio'] && <p className="erro">Erro: {erro['tempo-medio']}</p>}
        
        {relatorios.tempoMedio && (
          <div className="relatorio-dados">
            <div className="metricas-grid">
              <div className="metrica-card">
                <h4>Tempo Médio Geral</h4>
                <p className="valor-destaque">{relatorios.tempoMedio.tempoMedioGeral}</p>
              </div>
              <div className="metrica-card">
                <h4>Total de Atendimentos</h4>
                <p className="valor-destaque">{relatorios.tempoMedio.totalAtendimentos}</p>
              </div>
            </div>
            
            <h4>Tempo Médio por Prioridade:</h4>
            <div className="lista-dados">
              {Object.entries(relatorios.tempoMedio.tempoMedioPorPrioridade).map(([prioridade, tempo]) => (
                <div key={prioridade} className="item-dado">
                  <strong>{prioridade}:</strong> {tempo} minutos
                </div>
              ))}
            </div>
            
            <div className="botoes-exportar">
              <button 
                onClick={() => exportarJSON(relatorios.tempoMedio, 'tempo-medio-atendimento')}
                className="btn-relatorio btn-export"
              >
                Exportar JSON
              </button>
              <button 
                onClick={() => exportarCSV(relatorios.tempoMedio, 'tempo-medio-atendimento', 'tempo-medio')}
                className="btn-relatorio btn-export"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Relatório de Picos de Demanda */}
      <div className="relatorio-secao">
        <div className="relatorio-header">
          <h3>2. Picos de Demanda por Horário</h3>
          <div className="botoes-relatorio">
            <button 
              onClick={() => buscarRelatorio('picos-demanda')} 
              className="btn-relatorio btn-buscar"
              disabled={loading['picos-demanda']}
            >
              {loading['picos-demanda'] ? 'Carregando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
        
        {erro['picos-demanda'] && <p className="erro">Erro: {erro['picos-demanda']}</p>}
        
        {relatorios.picosDemanda && (
          <div className="relatorio-dados">
            <div className="metricas-grid">
              <div className="metrica-card">
                <h4>Horário de Pico</h4>
                <p className="valor-destaque">{relatorios.picosDemanda.picoHorario}</p>
              </div>
              <div className="metrica-card">
                <h4>Total no Pico</h4>
                <p className="valor-destaque">{relatorios.picosDemanda.totalPico}</p>
              </div>
            </div>
            
            <h4>Demanda por Horário (Top 10):</h4>
            <div className="lista-dados">
              {Object.entries(relatorios.picosDemanda.demandaPorHora)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 10)
                .map(([hora, dados]) => (
                  <div key={hora} className="item-dado">
                    <strong>{hora}:00 - {parseInt(hora)+1}:00:</strong> {dados.total} ({dados.triagens} triagens, {dados.atendimentos} atendimentos)
                  </div>
                ))}
            </div>
            
            <div className="botoes-exportar">
              <button 
                onClick={() => exportarJSON(relatorios.picosDemanda, 'picos-demanda')}
                className="btn-relatorio btn-export"
              >
                Exportar JSON
              </button>
              <button 
                onClick={() => exportarCSV(relatorios.picosDemanda, 'picos-demanda', 'picos-demanda')}
                className="btn-relatorio btn-export"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Relatório de Faixa Etária */}
      <div className="relatorio-secao">
        <div className="relatorio-header">
          <h3>3. Análise por Faixa Etária</h3>
          <div className="botoes-relatorio">
            <button 
              onClick={() => buscarRelatorio('faixa-etaria')} 
              className="btn-relatorio btn-buscar"
              disabled={loading['faixa-etaria']}
            >
              {loading['faixa-etaria'] ? 'Carregando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
        
        {erro['faixa-etaria'] && <p className="erro">Erro: {erro['faixa-etaria']}</p>}
        
        {relatorios.faixaEtaria && (
          <div className="relatorio-dados">
            <div className="faixas-grid">
              {Object.entries(relatorios.faixaEtaria).map(([faixa, dados]) => (
                <div key={faixa} className="faixa-card">
                  <h4>{faixa.charAt(0).toUpperCase() + faixa.slice(1)}</h4>
                  <p><strong>Total:</strong> {dados.total}</p>
                  <p><strong>Masculino:</strong> {dados.masculino}</p>
                  <p><strong>Feminino:</strong> {dados.feminino}</p>
                </div>
              ))}
            </div>
            
            <div className="botoes-exportar">
              <button 
                onClick={() => exportarJSON(relatorios.faixaEtaria, 'faixa-etaria')}
                className="btn-relatorio btn-export"
              >
                Exportar JSON
              </button>
              <button 
                onClick={() => exportarCSV(relatorios.faixaEtaria, 'faixa-etaria', 'faixa-etaria')}
                className="btn-relatorio btn-export"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Relatório de Diagnósticos */}
      <div className="relatorio-secao">
        <div className="relatorio-header">
          <h3>4. Diagnósticos Mais Comuns</h3>
          <div className="botoes-relatorio">
            <button 
              onClick={() => buscarRelatorio('diagnosticos')} 
              className="btn-relatorio btn-buscar"
              disabled={loading['diagnosticos']}
            >
              {loading['diagnosticos'] ? 'Carregando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
        
        {erro['diagnosticos'] && <p className="erro">Erro: {erro['diagnosticos']}</p>}
        
        {relatorios.diagnosticos && (
          <div className="relatorio-dados">
            <div className="metricas-grid">
              <div className="metrica-card">
                <h4>Total de Atendimentos</h4>
                <p className="valor-destaque">{relatorios.diagnosticos.totalAtendimentos}</p>
              </div>
            </div>
            
            <h4>Top 10 Diagnósticos:</h4>
            <div className="lista-dados ranking">
              {relatorios.diagnosticos.top10Diagnosticos.map((item, index) => (
                <div key={item.diagnostico} className="item-ranking">
                  <span className="posicao">{index + 1}º</span>
                  <strong>{item.diagnostico}:</strong> {item.count} casos
                </div>
              ))}
            </div>
            
            <div className="botoes-exportar">
              <button 
                onClick={() => exportarJSON(relatorios.diagnosticos, 'diagnosticos-comuns')}
                className="btn-relatorio btn-export"
              >
                Exportar JSON
              </button>
              <button 
                onClick={() => exportarCSV(relatorios.diagnosticos, 'diagnosticos-comuns', 'diagnosticos')}
                className="btn-relatorio btn-export"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Relatório de Prescrições */}
      <div className="relatorio-secao">
        <div className="relatorio-header">
          <h3>5. Prescrições Mais Utilizadas</h3>
          <div className="botoes-relatorio">
            <button 
              onClick={() => buscarRelatorio('prescricoes')} 
              className="btn-relatorio btn-buscar"
              disabled={loading['prescricoes']}
            >
              {loading['prescricoes'] ? 'Carregando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
        
        {erro['prescricoes'] && <p className="erro">Erro: {erro['prescricoes']}</p>}
        
        {relatorios.prescricoes && (
          <div className="relatorio-dados">
            <div className="metricas-grid">
              <div className="metrica-card">
                <h4>Total de Prescrições</h4>
                <p className="valor-destaque">{relatorios.prescricoes.totalPrescricoes}</p>
              </div>
            </div>
            
            <h4>Top 10 Prescrições:</h4>
            <div className="lista-dados ranking">
              {relatorios.prescricoes.top10Prescricoes.map((item, index) => (
                <div key={item.prescricao} className="item-ranking">
                  <span className="posicao">{index + 1}º</span>
                  <strong>{item.prescricao}:</strong> {item.count} prescrições
                </div>
              ))}
            </div>
            
            <div className="botoes-exportar">
              <button 
                onClick={() => exportarJSON(relatorios.prescricoes, 'prescricoes-utilizadas')}
                className="btn-relatorio btn-export"
              >
                Exportar JSON
              </button>
              <button 
                onClick={() => exportarCSV(relatorios.prescricoes, 'prescricoes-utilizadas', 'prescricoes')}
                className="btn-relatorio btn-export"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



