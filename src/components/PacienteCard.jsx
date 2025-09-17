import { calcularIdade } from '../utils/date'

import './PacienteCard.css'


export default function PacienteCard({ paciente, onSelecionar, onExcluir }) {
    const prioridade = (paciente.prioridade || '').toLowerCase();

    return (
        <article className={`paciente-card prioridade-${prioridade}`} onClick={() => onSelecionar(paciente.id)}>
            <div className={`cor-prioridade ${prioridade}`}></div>

            <div className="paciente-card-header">
                <h2>{paciente.nome}</h2>
                <p>Idade: {calcularIdade(paciente.dataNascimento)}</p>
                <button className='btn-excluir' onClick={(e) => { e.stopPropagation(); onExcluir && onExcluir(paciente.id); }}>Excluir</button>
            </div>
        </article>
    )
}