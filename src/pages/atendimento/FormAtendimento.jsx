
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPaciente } from '../../utils/api'
import { criarAtendimento } from '../../utils/api'
import { calcularIdade, calcularIMC } from '../../utils/date'

import './FormAtendimento.css'


export default function FormAtendimento() {
    const [formAtendimento, setFormAtendimento] = useState({
        motivo: '',
        diagnostico: '',
        prescricao: '',
        observacao: '',
    });

    const [paciente, setPaciente] = useState({})
    const { id } = useParams()
    const navigate = useNavigate()
    const salvoRef = useRef(false)

    useEffect(() => {
        async function fetchPaciente() {
            const pacienteAtendimento = await getPaciente(id);
            if (!pacienteAtendimento) return;
            setPaciente(pacienteAtendimento);
        }
        fetchPaciente();
        return () => {};
    }, [id]);

    // Seleciona a última triagem do paciente (se houver)
    const ultimaTriagem = useMemo(() => {
        if (!paciente.triagens || paciente.triagens.length === 0) return null;
        // Ordena por createdAt desc
        return [...paciente.triagens].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }, [paciente.triagens]);

    useEffect(() => {
        // Removeu lógica de emAtendimento, pois não é mais necessário
        // para o novo fluxo via API
        // Mantém apenas o fetchPaciente
        // (Se desejar lógica de bloqueio, implementar via backend)
        return () => {};
    }, [paciente]);

    function handleChange(e) {
        const { name, value } = e.target

        setFormAtendimento(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formAtendimento.motivo || !formAtendimento.diagnostico || !formAtendimento.prescricao) {
            alert('Preencha todos os campos');
            return;
        }
        // Salva o atendimento via API, incluindo funcionarioId
        const funcionarioId = localStorage.getItem('usuarioId');
        await criarAtendimento({
            pacienteId: paciente.id,
            funcionarioId,
            motivo: formAtendimento.motivo,
            diagnostico: formAtendimento.diagnostico,
            prescricao: formAtendimento.prescricao,
            observacao: formAtendimento.observacao,
            prioridade: paciente.prioridade || 'Normal'
        });
        salvoRef.current = true;
        alert('Atendimento salvo com sucesso!');
        navigate('/atendimento');
        window.scrollTo(0, 0);
    }

    async function handleVoltar() {
        navigate('/atendimento');
    }

    if (!paciente?.id) return <main><p>Paciente: {id}, não encontrado</p></main>

    return (
        <main className="atendimento-detalhe-content">
            <h2>Atendimento de {paciente.nome}</h2>

            <div className='paciente-info'>
                <div><b>Nome:</b> {paciente.nome}</div>
                <div><b>Idade:</b> {calcularIdade(paciente.dataNascimento)}</div>
                <div><b>Temperatura:</b> {ultimaTriagem?.temperatura ?? ''}</div>
                <div><b>Pressão:</b> {ultimaTriagem?.pressao ?? ''}</div>
                <div><b>IMC:</b> {ultimaTriagem ? calcularIMC(ultimaTriagem.peso, ultimaTriagem.altura) : ''}</div>
                {ultimaTriagem && <div><b>Data da Triagem:</b> {new Date(ultimaTriagem.createdAt).toLocaleString()}</div>}
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
                <label>Motivo da Consulta:</label>
                <input
                    type="text"
                    name="motivo"
                    value={formAtendimento.motivo}
                    onChange={handleChange}
                    required
                />

                <label>Diagnóstico:</label>
                <input
                    type="text"
                    name="diagnostico"
                    value={formAtendimento.diagnostico}
                    onChange={handleChange}
                    required
                />

                <label>Prescrição:</label>
                <textarea
                    name="prescricao"
                    value={formAtendimento.prescricao}
                    onChange={handleChange}
                    rows={2}
                />

                <label>Observação:</label>
                <textarea
                    name="observacao"
                    value={formAtendimento.observacao}
                    onChange={handleChange}
                    rows={2}
                />

                <div className="botoes-atendimento">
                    <button className="btn-form cancelar-btn-atendimento cancelar" type="button" onClick={handleVoltar}>Voltar</button>

                    <button className="btn-form salvar-btn-atendimento" type="submit">Salvar Atendimento</button>
                </div>
            </form>
        </main>
    )
}
