import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPaciente, atualizarPaciente } from '../../utils/dados'
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
            if (!pacienteAtendimento.emAtendimento && !salvoRef.current) {
                pacienteAtendimento.emAtendimento = true;
                await atualizarPaciente(pacienteAtendimento.id, pacienteAtendimento);
            }
        }
        fetchPaciente();
        return () => {};
    }, [id]);

    useEffect(() => {
        if (!paciente?.id) return;
        const handleBeforeUnload = async (event) => {
            if (salvoRef.current) return;
            event.preventDefault();
            event.returnValue = "";
            const pacienteAtualizado = { ...paciente, emAtendimento: false };
            await atualizarPaciente(pacienteAtualizado.id, pacienteAtualizado);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
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
        const pacienteAtualizado = {
            ...paciente,
            atendimento: formAtendimento,
        };
        delete pacienteAtualizado.emAtendimento;
        await atualizarPaciente(pacienteAtualizado.id, pacienteAtualizado);
        salvoRef.current = true;
        alert('Atendimento salvo com sucesso!');
        navigate('/atendimento');
        window.scrollTo(0, 0);
    }

    async function handleVoltar() {
        const pacienteAtualizado = {
            ...paciente,
            atendimento: undefined,
            emAtendimento: false,
        };
        await atualizarPaciente(pacienteAtualizado.id, pacienteAtualizado);
        navigate('/atendimento');
    }

    if (!paciente?.id) return <main><p>Paciente: {id}, não encontrado</p></main>

    return (
        <main className="atendimento-detalhe-content">
            <h2>Atendimento de {paciente.nome}</h2>

            <div className='paciente-info'>
                <div><b>Nome:</b> {paciente.nome}</div>
                <div><b>Idade:</b> {calcularIdade(paciente.dataNascimento)}</div>
                <div><b>Temperatura:</b> {paciente.triagem?.temperatura || ''}</div>
                <div><b>Pressão:</b> {paciente.triagem?.pressao || ''}</div>
                <div><b>IMC:</b> {calcularIMC(paciente.triagem.peso, paciente.triagem.altura)}</div>
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
