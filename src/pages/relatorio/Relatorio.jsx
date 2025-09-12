import React, { useEffect, useState } from "react";
import "./Relatorio.css";

function calcularTempoMedio(atendimentos) {
  if (!atendimentos.length) return 0;
  const total = atendimentos.reduce((acc, a) => acc + (a.tempoEspera || 0), 0);
  return (total / atendimentos.length).toFixed(2);
}

function exportarJSON(relatorio) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(relatorio, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', 'relatorio.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportarCSV(relatorio) {
  let csv = 'Médico,Atendimentos\n';
  Object.entries(relatorio.atendidosPorMedico).forEach(([medico, qtd]) => {
    csv += `${medico},${qtd}\n`;
  });
  csv += '\nPrioridade,Quantidade\n';
  Object.entries(relatorio.pacientesPorPrioridade).forEach(([prioridade, qtd]) => {
    csv += `${prioridade},${qtd}\n`;
  });
  csv += `\nTempo médio de espera (min),${relatorio.tempoMedioEspera}\n`;
  const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', 'relatorio.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Relatorio() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [relatorio, setRelatorio] = useState({ atendidosPorMedico: {}, tempoMedioEspera: 0, pacientesPorPrioridade: {} });

  useEffect(() => {
    // Supondo que os atendimentos estão no localStorage
    const data = JSON.parse(localStorage.getItem("atendimentos") || "[]");
    setAtendimentos(data);
    // Agrupar por médico
    const atendidosPorMedico = data.reduce((acc, a) => {
      acc[a.medico] = (acc[a.medico] || 0) + 1;
      return acc;
    }, {});
    // Agrupar por prioridade
    const pacientesPorPrioridade = data.reduce((acc, a) => {
      acc[a.prioridade] = (acc[a.prioridade] || 0) + 1;
      return acc;
    }, {});
    // Tempo médio de espera
    const tempoMedioEspera = calcularTempoMedio(data);
    setRelatorio({ atendidosPorMedico, tempoMedioEspera, pacientesPorPrioridade });
  }, []);

  return (
    <div className="container-relatorio">
      <h2>Relatório de Atendimentos</h2>
      <div className="relatorio-metricas">
        <div>
          <strong>Tempo médio de espera (min):</strong> {relatorio.tempoMedioEspera}
        </div>
      </div>
      <h3>Pacientes atendidos por médico</h3>
      <ul>
        {Object.entries(relatorio.atendidosPorMedico).map(([medico, qtd]) => (
          <li key={medico}><strong>{medico}:</strong> {qtd}</li>
        ))}
      </ul>
      <h3>Pacientes por prioridade</h3>
      <ul>
        {Object.entries(relatorio.pacientesPorPrioridade).map(([prioridade, qtd]) => (
          <li key={prioridade}><strong>{prioridade}:</strong> {qtd}</li>
        ))}
      </ul>
      <div style={{ marginTop: 24 }}>
        <button onClick={() => exportarJSON(relatorio)} className="btn-relatorio">Exportar JSON</button>
        <button onClick={() => exportarCSV(relatorio)} className="btn-relatorio">Exportar CSV</button>
      </div>
    </div>
  );
}



