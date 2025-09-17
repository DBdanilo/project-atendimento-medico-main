import React, { useState, useEffect, useCallback } from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getDashboardConsolidado } from "../../utils/api";
import "./Relatorio.css";

export default function Relatorio() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [proximaAtualizacao, setProximaAtualizacao] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Função para buscar dados do dashboard consolidado
  const buscarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      
      console.log('Buscando dados do dashboard do backend...');
      
      // Chamar o endpoint do backend
      const dadosDashboard = await getDashboardConsolidado();
      
      console.log('Dados recebidos do backend:', dadosDashboard);
      
      // Validar e normalizar dados se necessário
      const dashboardNormalizado = {
        ultimaAtualizacao: dadosDashboard.ultimaAtualizacao || new Date().toISOString(),
        tempoMedio: dadosDashboard.tempoMedio || {
          tempoMedioGeral: "0 minutos",
          tempoMedioPorPrioridade: { ALTA: 0, MEDIA: 0, BAIXA: 0 },
          totalAtendimentos: 0
        },
        picosDemanda: dadosDashboard.picosDemanda || {
          demandaPorHora: {},
          picoHorario: "N/A",
          totalPico: 0
        },
        faixaEtaria: dadosDashboard.faixaEtaria || {
          pediatria: { masculino: 0, feminino: 0, total: 0 },
          adolescente: { masculino: 0, feminino: 0, total: 0 },
          adulto: { masculino: 0, feminino: 0, total: 0 },
          idoso: { masculino: 0, feminino: 0, total: 0 }
        },
        diagnosticos: dadosDashboard.diagnosticos || {
          top10Diagnosticos: [],
          totalAtendimentos: 0
        },
        prescricoes: dadosDashboard.prescricoes || {
          top10Prescricoes: [],
          totalPrescricoes: 0
        }
      };
      
      setDashboard(dashboardNormalizado);
      setUltimaAtualizacao(new Date());
      
      // Calcular próxima atualização (5 minutos)
      const proxima = new Date();
      proxima.setMinutes(proxima.getMinutes() + 5);
      setProximaAtualizacao(proxima);
      
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      setErro(`Erro ao conectar com o backend: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Configurar atualização automática
  useEffect(() => {
    // Buscar dados imediatamente ao montar o componente
    buscarDashboard();

    // Configurar interval para atualização automática a cada 5 minutos
    let interval;
    if (autoUpdate) {
      interval = setInterval(() => {
        console.log('Atualizando dashboard automaticamente...');
        buscarDashboard();
      }, 5 * 60 * 1000); // 5 minutos em millisegundos
    }

    // Cleanup do interval
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [buscarDashboard, autoUpdate]);

  // Funções de exportação
  const exportarJSON = (dados, nomeArquivo) => {
    const dataStr = JSON.stringify(dados, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${nomeArquivo}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportarCSV = (dados, nomeArquivo, tipo) => {
    let csvContent = '';
    
    if (tipo === 'tempo-medio') {
      csvContent = 'Métrica,Valor\n';
      csvContent += `Tempo Médio Geral,${dados.tempoMedioGeral}\n`;
      csvContent += `Total de Atendimentos,${dados.totalAtendimentos}\n`;
      csvContent += '\nPrioridade,Tempo Médio (min)\n';
      Object.entries(dados.tempoMedioPorPrioridade).forEach(([prioridade, tempo]) => {
        csvContent += `${prioridade},${tempo}\n`;
      });
    } else if (tipo === 'picos-demanda') {
      csvContent = 'Horário,Triagens,Atendimentos,Total\n';
      Object.entries(dados.demandaPorHora).forEach(([hora, info]) => {
        csvContent += `${hora}:00-${parseInt(hora)+1}:00,${info.triagens},${info.atendimentos},${info.total}\n`;
      });
    } else if (tipo === 'faixa-etaria') {
      csvContent = 'Faixa Etária,Masculino,Feminino,Total\n';
      Object.entries(dados).forEach(([faixa, info]) => {
        csvContent += `${faixa},${info.masculino},${info.feminino},${info.total}\n`;
      });
    } else if (tipo === 'diagnosticos') {
      csvContent = 'Posição,Diagnóstico,Quantidade\n';
      dados.top10Diagnosticos.forEach((item, index) => {
        csvContent += `${index + 1},${item.diagnostico},${item.count}\n`;
      });
    } else if (tipo === 'prescricoes') {
      csvContent = 'Posição,Prescrição,Quantidade\n';
      dados.top10Prescricoes.forEach((item, index) => {
        csvContent += `${index + 1},${item.prescricao},${item.count}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeArquivo}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = (dados, nomeArquivo, tipo) => {
    try {
      console.log('=== EXPORTAR PDF ===');
      console.log('Tipo:', tipo);
      console.log('Dados:', dados);
      
      setGerandoPDF(true);
      
      if (!dados) {
        throw new Error('Dados não encontrados para geração do PDF');
      }

      // Criar documento PDF
      const doc = new jsPDF();
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const horaAtual = new Date().toLocaleTimeString('pt-BR');
      
      // Cabeçalho profissional
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235); // Azul do projeto
      doc.text('Sistema Hospitalar - Relatório Gerencial', 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 20, 30);
      doc.text(`Relatório: ${tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('-', ' ')}`, 20, 36);
      
      // Linha separadora
      doc.setDrawColor(37, 99, 235);
      doc.line(20, 42, 190, 42);
      
      let yPosition = 55;
      doc.setTextColor(0, 0, 0);
      
      // Processamento por tipo de relatório
      if (tipo === 'tempo-medio') {
        doc.setFontSize(14);
        doc.text('Análise de Tempo Médio de Atendimento', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(11);
        doc.text(`Tempo Médio Geral: ${dados.tempoMedioGeral || 'N/A'}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Total de Atendimentos: ${dados.totalAtendimentos || 0}`, 20, yPosition);
        yPosition += 15;
        
        if (dados.tempoMedioPorPrioridade && Object.keys(dados.tempoMedioPorPrioridade).length > 0) {
          doc.text('Tempo Médio por Prioridade:', 20, yPosition);
          yPosition += 10;
          
          Object.entries(dados.tempoMedioPorPrioridade).forEach(([prioridade, tempo]) => {
            doc.text(`• ${prioridade}: ${tempo} minutos`, 30, yPosition);
            yPosition += 8;
          });
        }
        
      } else if (tipo === 'picos-demanda') {
        doc.setFontSize(14);
        doc.text('Análise de Picos de Demanda', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(11);
        doc.text(`Horário de Maior Demanda: ${dados.picoHorario || 'N/A'}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Pico de Atendimentos: ${dados.totalPico || 0}`, 20, yPosition);
        yPosition += 15;
        
        if (dados.demandaPorHora && Object.keys(dados.demandaPorHora).length > 0) {
          doc.text('Top 10 Horários com Maior Demanda:', 20, yPosition);
          yPosition += 10;
          
          const sortedHours = Object.entries(dados.demandaPorHora)
            .sort(([,a], [,b]) => (b.total || 0) - (a.total || 0))
            .slice(0, 10);
          
          sortedHours.forEach(([hora, info], index) => {
            doc.text(`${index + 1}. ${hora}:00-${parseInt(hora)+1}:00 - Total: ${info.total || 0}`, 30, yPosition);
            yPosition += 8;
          });
        }
        
      } else if (tipo === 'faixa-etaria') {
        doc.setFontSize(14);
        doc.text('Análise por Faixa Etária', 20, yPosition);
        yPosition += 15;
        
        if (dados && Object.keys(dados).length > 0) {
          Object.entries(dados).forEach(([faixa, info]) => {
            const faixaCapitalizada = faixa.charAt(0).toUpperCase() + faixa.slice(1);
            doc.text(`• ${faixaCapitalizada}:`, 30, yPosition);
            yPosition += 8;
            doc.text(`  Masculino: ${info.masculino || 0} | Feminino: ${info.feminino || 0} | Total: ${info.total || 0}`, 35, yPosition);
            yPosition += 12;
          });
        }
        
      } else if (tipo === 'diagnosticos') {
        doc.setFontSize(14);
        doc.text('Diagnósticos Mais Comuns', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(11);
        doc.text(`Total de Atendimentos: ${dados.totalAtendimentos || 0}`, 20, yPosition);
        yPosition += 15;
        
        if (dados.top10Diagnosticos && dados.top10Diagnosticos.length > 0) {
          doc.text('Top 10 Diagnósticos:', 20, yPosition);
          yPosition += 10;
          
          dados.top10Diagnosticos.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.diagnostico || 'N/A'} - ${item.count || 0} casos`, 30, yPosition);
            yPosition += 8;
          });
        }
        
      } else if (tipo === 'prescricoes') {
        doc.setFontSize(14);
        doc.text('Prescrições Mais Utilizadas', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(11);
        doc.text(`Total de Prescrições: ${dados.totalPrescricoes || 0}`, 20, yPosition);
        yPosition += 15;
        
        if (dados.top10Prescricoes && dados.top10Prescricoes.length > 0) {
          doc.text('Top 10 Prescrições:', 20, yPosition);
          yPosition += 10;
          
          dados.top10Prescricoes.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.prescricao || 'N/A'} - ${item.count || 0} vezes`, 30, yPosition);
            yPosition += 8;
          });
        }
      }
      
      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Sistema de Gestão Hospitalar', 20, 285);
      doc.text(`Página 1 de 1`, 170, 285);
      
      // Salvar PDF
      const nomeCompleto = `${nomeArquivo}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeCompleto);
      console.log(`PDF gerado com sucesso: ${nomeCompleto}`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${error.message}`);
    } finally {
      setGerandoPDF(false);
    }
  };

  const formatarHorario = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleTimeString('pt-BR');
  };

  const toggleAutoUpdate = () => {
    setAutoUpdate(!autoUpdate);
  };

  if (loading && !dashboard) {
    return (
      <main className="relatorio">
        <div className="container-relatorio">
          <div className="loading-dashboard">
            <h1>Carregando Dashboard...</h1>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relatorio">
      <div className="container-relatorio">
        <div className="dashboard-header">
          <h1>Dashboard de Relatórios Gerenciais</h1>
        
        <div className="controles-dashboard">
          <div className="info-atualizacao">
            {ultimaAtualizacao && (
              <span>Última atualização: {formatarHorario(ultimaAtualizacao)}</span>
            )}
            {proximaAtualizacao && autoUpdate && (
              <span>Próxima: {formatarHorario(proximaAtualizacao)}</span>
            )}
          </div>
          
          <div className="botoes-controle">
            <button 
              onClick={buscarDashboard}
              className="btn-relatorio btn-refresh"
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar Agora'}
            </button>
            
            <button 
              onClick={toggleAutoUpdate}
              className={`btn-relatorio ${autoUpdate ? 'btn-auto-on' : 'btn-auto-off'}`}
            >
              Auto-update: {autoUpdate ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {erro && (
        <div className="erro-dashboard">
          <p>Erro ao carregar dados: {erro}</p>
          <button onClick={buscarDashboard} className="btn-relatorio btn-retry">
            Tentar Novamente
          </button>
        </div>
      )}

      {dashboard && (
        <div className="dashboard-content">
          
          {/* Relatório de Tempo Médio */}
          <div className="relatorio-secao">
            <div className="relatorio-header">
              <h3>1. Tempo Médio de Atendimento</h3>
            </div>
            
            <div className="relatorio-dados">
              <div className="metricas-grid">
                <div className="metrica-card">
                  <h4>Tempo Médio Geral</h4>
                  <p className="valor-destaque">{dashboard.tempoMedio.tempoMedioGeral}</p>
                </div>
                <div className="metrica-card">
                  <h4>Total de Atendimentos</h4>
                  <p className="valor-destaque">{dashboard.tempoMedio.totalAtendimentos}</p>
                </div>
              </div>
              
              <h4>Tempo Médio por Prioridade:</h4>
              <div className="lista-dados">
                {Object.entries(dashboard.tempoMedio.tempoMedioPorPrioridade).map(([prioridade, tempo]) => (
                  <div key={prioridade} className="item-dado">
                    <strong>{prioridade}:</strong> {tempo} minutos
                  </div>
                ))}
              </div>
              
              <div className="botoes-exportar">
                <button 
                  onClick={() => exportarJSON(dashboard.tempoMedio, 'tempo-medio-atendimento')}
                  className="btn-relatorio btn-export"
                >
                  📄 JSON
                </button>
                <button 
                  onClick={() => exportarCSV(dashboard.tempoMedio, 'tempo-medio-atendimento', 'tempo-medio')}
                  className="btn-relatorio btn-export"
                >
                  📊 CSV
                </button>
                <button 
                  onClick={() => exportarPDF(dashboard.tempoMedio, 'tempo-medio-atendimento', 'tempo-medio')}
                  className="btn-relatorio btn-export-pdf"
                  disabled={gerandoPDF}
                >
                  {gerandoPDF ? '⏳ Gerando...' : '📄 PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Relatório de Picos de Demanda */}
          <div className="relatorio-secao">
            <div className="relatorio-header">
              <h3>2. Picos de Demanda por Horário</h3>
            </div>
            
            <div className="relatorio-dados">
              <div className="metricas-grid">
                <div className="metrica-card">
                  <h4>Horário de Pico</h4>
                  <p className="valor-destaque">{dashboard.picosDemanda.picoHorario}</p>
                </div>
                <div className="metrica-card">
                  <h4>Total no Pico</h4>
                  <p className="valor-destaque">{dashboard.picosDemanda.totalPico}</p>
                </div>
              </div>
              
              <h4>Demanda por Horário (Top 10):</h4>
              <div className="lista-dados">
                {Object.entries(dashboard.picosDemanda.demandaPorHora)
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
                  onClick={() => exportarJSON(dashboard.picosDemanda, 'picos-demanda')}
                  className="btn-relatorio btn-export"
                >
                  📄 JSON
                </button>
                <button 
                  onClick={() => exportarCSV(dashboard.picosDemanda, 'picos-demanda', 'picos-demanda')}
                  className="btn-relatorio btn-export"
                >
                  📊 CSV
                </button>
                <button 
                  onClick={() => exportarPDF(dashboard.picosDemanda, 'picos-demanda', 'picos-demanda')}
                  className="btn-relatorio btn-export-pdf"
                  disabled={gerandoPDF}
                >
                  {gerandoPDF ? '⏳ Gerando...' : '📄 PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Relatório de Faixa Etária */}
          <div className="relatorio-secao">
            <div className="relatorio-header">
              <h3>3. Análise por Faixa Etária</h3>
            </div>
            
            <div className="relatorio-dados">
              <div className="faixas-grid">
                {Object.entries(dashboard.faixaEtaria).map(([faixa, dados]) => (
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
                  onClick={() => exportarJSON(dashboard.faixaEtaria, 'faixa-etaria')}
                  className="btn-relatorio btn-export"
                >
                  📄 JSON
                </button>
                <button 
                  onClick={() => exportarCSV(dashboard.faixaEtaria, 'faixa-etaria', 'faixa-etaria')}
                  className="btn-relatorio btn-export"
                >
                  📊 CSV
                </button>
                <button 
                  onClick={() => exportarPDF(dashboard.faixaEtaria, 'faixa-etaria', 'faixa-etaria')}
                  className="btn-relatorio btn-export-pdf"
                  disabled={gerandoPDF}
                >
                  {gerandoPDF ? '⏳ Gerando...' : '📄 PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Relatório de Diagnósticos */}
          <div className="relatorio-secao">
            <div className="relatorio-header">
              <h3>4. Diagnósticos Mais Comuns</h3>
            </div>
            
            <div className="relatorio-dados">
              <div className="metricas-grid">
                <div className="metrica-card">
                  <h4>Total de Atendimentos</h4>
                  <p className="valor-destaque">{dashboard.diagnosticos.totalAtendimentos}</p>
                </div>
              </div>
              
              <h4>Top 10 Diagnósticos:</h4>
              <div className="lista-dados ranking">
                {dashboard.diagnosticos.top10Diagnosticos.map((item, index) => (
                  <div key={item.diagnostico} className="item-ranking">
                    <span className="posicao">{index + 1}º</span>
                    <strong>{item.diagnostico}:</strong> {item.count} casos
                  </div>
                ))}
              </div>
              
              <div className="botoes-exportar">
                <button 
                  onClick={() => exportarJSON(dashboard.diagnosticos, 'diagnosticos-comuns')}
                  className="btn-relatorio btn-export"
                >
                  📄 JSON
                </button>
                <button 
                  onClick={() => exportarCSV(dashboard.diagnosticos, 'diagnosticos-comuns', 'diagnosticos')}
                  className="btn-relatorio btn-export"
                >
                  📊 CSV
                </button>
                <button 
                  onClick={() => exportarPDF(dashboard.diagnosticos, 'diagnosticos-comuns', 'diagnosticos')}
                  className="btn-relatorio btn-export-pdf"
                  disabled={gerandoPDF}
                >
                  {gerandoPDF ? '⏳ Gerando...' : '📄 PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Relatório de Prescrições */}
          <div className="relatorio-secao">
            <div className="relatorio-header">
              <h3>5. Prescrições Mais Utilizadas</h3>
            </div>
            
            <div className="relatorio-dados">
              <div className="metricas-grid">
                <div className="metrica-card">
                  <h4>Total de Prescrições</h4>
                  <p className="valor-destaque">{dashboard.prescricoes.totalPrescricoes}</p>
                </div>
              </div>
              
              <h4>Top 10 Prescrições:</h4>
              <div className="lista-dados ranking">
                {dashboard.prescricoes.top10Prescricoes.map((item, index) => (
                  <div key={item.prescricao} className="item-ranking">
                    <span className="posicao">{index + 1}º</span>
                    <strong>{item.prescricao}:</strong> {item.count} prescrições
                  </div>
                ))}
              </div>
              
              <div className="botoes-exportar">
                <button 
                  onClick={() => exportarJSON(dashboard.prescricoes, 'prescricoes-utilizadas')}
                  className="btn-relatorio btn-export"
                >
                  📄 JSON
                </button>
                <button 
                  onClick={() => exportarCSV(dashboard.prescricoes, 'prescricoes-utilizadas', 'prescricoes')}
                  className="btn-relatorio btn-export"
                >
                  📊 CSV
                </button>
                <button 
                  onClick={() => exportarPDF(dashboard.prescricoes, 'prescricoes-utilizadas', 'prescricoes')}
                  className="btn-relatorio btn-export-pdf"
                  disabled={gerandoPDF}
                >
                  {gerandoPDF ? '⏳ Gerando...' : '📄 PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}