import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faUserCheck, faExclamationCircle, faHeartbeat, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getPacientes } from '../../utils/dados';
import './PainelSituacao.css';

export default function PainelSituacao() {
    const [pacientes, setPacientes] = useState([]);
    const [horaPainel, setHoraPainel] = useState(new Date());

    useEffect(() => {
        async function atualizarPainel() {
            const todos = await getPacientes();
            setPacientes(todos);
        }
        atualizarPainel();
        const interval = setInterval(() => {
            setHoraPainel(new Date());
            atualizarPainel();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Filtrar 3 últimos triagens iniciadas
    const triagensIniciadas = pacientes
        .filter(p => Array.isArray(p.triagens) && p.triagens.length > 0)
        .sort((a, b) => new Date(b.triagens[b.triagens.length-1]?.createdAt || 0) - new Date(a.triagens[a.triagens.length-1]?.createdAt || 0))
        .slice(0, 3);

    // Filtrar 3 últimos atendimentos iniciados
    const atendimentosIniciados = pacientes
        .filter(p => Array.isArray(p.atendimentos) && p.atendimentos.length > 0)
        .sort((a, b) => new Date(b.atendimentos[b.atendimentos.length-1]?.createdAt || 0) - new Date(a.atendimentos[a.atendimentos.length-1]?.createdAt || 0))
        .slice(0, 3);

    function formatarDataHora(dt) {
        if (!dt) return '';
        const d = new Date(dt);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <main className="painel-situacao">
            <h1>Painel de Situação dos Pacientes</h1>
            <div className="painel-horario destaque-horario">{formatarDataHora(horaPainel)}</div>
            <div className="painel-colunas">
                <div className="painel-coluna">
                    <h2><FontAwesomeIcon icon={faStethoscope} className="painel-status-icon" />chamado para triagem na sala 1</h2>
                    {triagensIniciadas.length === 0 && <p className="vazio">Nenhum paciente</p>}
                    {triagensIniciadas.map((p, idx) => (
                        <div className={`painel-card prioridade-${p.prioridade?.toLowerCase()}`} key={p.id || p.nome + idx}>
                            <span className="painel-nome">{p.nome}</span>
                            <span className="painel-prioridade">{p.prioridade}</span>
                            <span className="painel-hora">Início: {formatarDataHora(p.triagens[p.triagens.length-1]?.createdAt)}</span>
                        </div>
                    ))}
                </div>
                <div className="painel-coluna">
                    <h2><FontAwesomeIcon icon={faUserCheck} className="painel-status-icon" />Dirigir-se ao consultório para atendimento</h2>
                    {atendimentosIniciados.length === 0 && <p className="vazio">Nenhum paciente</p>}
                    {atendimentosIniciados.map((p, idx) => (
                        <div className={`painel-card prioridade-${p.prioridade?.toLowerCase()}`} key={p.id || p.nome + idx}>
                            <span className="painel-nome">{p.nome}</span>
                            <span className="painel-prioridade">{p.prioridade}</span>
                            <span className="painel-hora">Início: {formatarDataHora(p.atendimentos[p.atendimentos.length-1]?.createdAt)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}