import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Prioridade from "../../components/Prioridade"
import { getPaciente, atualizarPaciente } from "../../utils/api"
import { calcularIdade } from "../../utils/date"

import './FormTriagem.css'


export default function FormTriagem() {
    const [formTriagem, setFormTriagem] = useState({
        temperatura: '',
        pressao: '',
        peso: '',
        altura: '',
        observacao: '',
        prioridade: '',
    })

    const [paciente, setPaciente] = useState({})
    const { id } = useParams()
    const navigate = useNavigate()
    const salvoRef = useRef(false)

    useEffect(() => {
        if (!paciente?.id) return;
        const handleBeforeUnload = async (event) => {
            if (salvoRef.current) return;
            event.preventDefault();
            event.returnValue = "";
            const pacienteAtualizado = { ...paciente, emTriagem: false };
            await atualizarPaciente(pacienteAtualizado.id, pacienteAtualizado);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [paciente]);

    useEffect(() => {
        async function fetchPaciente() {
            const pacienteTriagem = await getPaciente(id);
            if (!pacienteTriagem) return;
            setPaciente(pacienteTriagem);
            setFormTriagem(prev => {
                if (Object.values(prev).some(v => v)) return prev;
                if (pacienteTriagem.triagem) {
                    return pacienteTriagem.triagem;
                }
                return {
                    ...prev,
                    prioridade: pacienteTriagem.prioridade,
                };
            });
            if (!pacienteTriagem.emTriagem && !salvoRef.current) {
                pacienteTriagem.emTriagem = true;
                await atualizarPaciente(pacienteTriagem.id, pacienteTriagem);
            }
        }
        fetchPaciente();
        return () => {};
    }, [id]);

    function handleChange(e) {
        const { name, value } = e.target

        setFormTriagem(prev => ({ ...prev, [name]: value }))
    }

    function handlePrioridade(novaPrioridade) {
        setFormTriagem(prev => ({ ...prev, prioridade: novaPrioridade }));
    }


    async function handleSubmit(e) {
        e.preventDefault();
        if (!formTriagem.temperatura || !formTriagem.pressao || !formTriagem.peso || !formTriagem.altura) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }
        // Salva a triagem de forma persistente
        await import('../../utils/api').then(async ({ criarTriagem, atualizarPaciente }) => {
            await criarTriagem({
                pacienteId: paciente.id,
                prioridade: formTriagem.prioridade,
                temperatura: parseFloat(formTriagem.temperatura),
                pressao: formTriagem.pressao,
                peso: parseFloat(formTriagem.peso),
                altura: parseFloat(formTriagem.altura),
                observacao: formTriagem.observacao
            });
            // Atualiza o paciente para remover da lista de espera
            await atualizarPaciente(paciente.id, { listaEsperaTriagem: false });
        });
        salvoRef.current = true;
        alert('Triagem salva com sucesso!');
        navigate('/triagem');
        window.scrollTo(0, 0);
    }

    async function handleVoltar() {
        const pacienteAtualizado = {
            ...paciente,
            triagem: undefined,
            emTriagem: false,
        };
        await atualizarPaciente(pacienteAtualizado.id, pacienteAtualizado);
        navigate('/triagem');
        window.scrollTo(0, 0);
    }


    if (!paciente?.id) return <main><p>Paciente: {id}, não encontrado</p></main>

    return (
        <main className="triagem-detalhe-content">
            <h2>{`Triagem de ${paciente.nome}`}</h2>

            <div className="paciente-info">
                <div><b>Nome:</b> {paciente.nome}</div>
                <div><b>Idade:</b> {calcularIdade(paciente.dataNascimento)}</div>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="input-row">
                    <div className="input-group">
                        <label>Temperatura (°C):</label>
                        <input
                            type="number"
                            step="0.1"
                            name="temperatura"
                            value={formTriagem.temperatura}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 36.7"
                        />
                    </div>

                    <div className="input-group">
                        <label>Pressão (mmHg):</label>
                        <input
                            type="text"
                            name="pressao"
                            value={formTriagem.pressao}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 12/8"
                        />
                    </div>
                </div>

                <div className="input-row">
                    <div className="input-group">
                        <label>Peso (kg):</label>
                        <input
                            type="number"
                            step="0.1"
                            name="peso"
                            value={formTriagem.peso}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 70.5"
                        />
                    </div>

                    <div className="input-group">
                        <label>Altura (cm):</label>
                        <input
                            type="number"
                            step="0.1"
                            name="altura"
                            value={formTriagem.altura}
                            onChange={handleChange}
                            required
                            placeholder="Ex: 175"
                        />
                    </div>
                </div>

                <label>Observação:</label>
                <textarea
                    name="observacao"
                    value={formTriagem.observacao}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Observações relevantes..."
                />

                <div className="botoes-triagem-row">
                    <label className="label-reclassificar">Reclassificar Prioridade:</label>
                    <Prioridade
                        prioridade={formTriagem.prioridade}
                        onChange={handlePrioridade}
                    />

                    <div className="botoes-triagem">
                        <button className='btn-form cancelar-btn-triagem cancelar' type="button" onClick={() => handleVoltar()}>Cancelar</button>

                        <button className='btn-form salvar-btn-triagem' type="submit">Salvar Triagem</button>
                    </div>
                </div>
            </form>
        </main>
    )
}
