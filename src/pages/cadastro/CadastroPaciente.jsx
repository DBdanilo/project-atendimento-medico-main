
import { useState } from 'react'
import Prioridade from '../../components/Prioridade'
import { criarPaciente, getPacientePorCpf } from '../../utils/api'
import './CadastroPaciente.css'

export default function CadastroPaciente() {
    const [form, setForm] = useState({
        nome: '',
        cpf: '',
        dataNascimento: '',
        sexo: '',
        endereco: '',
        telefone: '',
        prioridade: 'Normal',
    })
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [buscaCpf, setBuscaCpf] = useState("");
    const [buscando, setBuscando] = useState(false);
    async function handleBuscarPaciente(e) {
        e.preventDefault();
        setMensagem("");
        setErro("");
        setBuscando(true);
        try {
            // Remove pontos e traço do CPF antes de buscar
            const cpfBusca = buscaCpf.replace(/\D/g, '');
            const paciente = await getPacientePorCpf(cpfBusca);
            console.log('Resposta da API (getPacientePorCpf):', paciente);
            if (paciente) {
                // Converter data para yyyy-MM-dd se vier em outro formato
                let dataNascimento = '';
                if (paciente.dataNascimento) {
                    const d = new Date(paciente.dataNascimento);
                    dataNascimento = d.toISOString().slice(0,10);
                }
                setForm({
                    nome: paciente.nome || '',
                    cpf: paciente.cpf || '',
                    dataNascimento,
                    sexo: paciente.sexo || '',
                    endereco: paciente.endereco || '',
                    telefone: paciente.telefone || '',
                    prioridade: paciente.prioridade || 'Normal',
                });
                setMensagem('Paciente encontrado e carregado no formulário. Você pode clicar em "Incluir na Triagem".');
            } else {
                setErro('Paciente não encontrado. Preencha os dados para cadastrar.');
            }
        } catch (err) {
            console.error('Erro ao buscar paciente por CPF:', err);
            setErro('Paciente não encontrado. Preencha os dados para cadastrar.');
        }
        setBuscando(false);
    }
    // const [ultimoPacienteId, setUltimoPacienteId] = useState(null);


    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }))
    }

    function handlePrioridade(novaPrioridade) {
        setForm(prev => ({ ...prev, prioridade: novaPrioridade }))
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMensagem("");
        setErro("");
    // setIncluindo(false);
        try {
            // Enviar apenas os campos esperados pelo backend
            // Converter dataNascimento de dd/mm/aaaa para ISO
            let dataISO = '';
            if (form.dataNascimento && form.dataNascimento.includes('/')) {
                const [dia, mes, ano] = form.dataNascimento.split('/');
                dataISO = new Date(`${ano}-${mes}-${dia}`).toISOString();
            } else if (form.dataNascimento) {
                dataISO = new Date(form.dataNascimento).toISOString();
            }
            const pacientePayload = {
                nome: form.nome,
                cpf: form.cpf,
                dataNascimento: dataISO,
                sexo: form.sexo,
                endereco: form.endereco,
                telefone: form.telefone,
                prioridade: form.prioridade,
            };
            await criarPaciente(pacientePayload);
            setMensagem('Paciente cadastrado com sucesso!');
            // setUltimoPacienteId(paciente.id);
            setForm({
                nome: '',
                cpf: '',
                dataNascimento: '',
                sexo: '',
                endereco: '',
                telefone: '',
                prioridade: 'Normal',
            });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setErro(err.response.data.error);
            } else {
                setErro('Erro ao cadastrar paciente');
            }
        }
    }


    async function handleIncluirTriagem(e) {
        e.preventDefault();
        setMensagem("");
        setErro("");
        try {
            // Remove pontos e traço do CPF para busca
            const cpfBusca = form.cpf.replace(/\D/g, '');
            let pacienteExistente = null;
            try {
                pacienteExistente = await getPacientePorCpf(cpfBusca);
            } catch {}

            // Converter dataNascimento de dd/mm/aaaa para ISO
            let dataISO2 = '';
            if (form.dataNascimento && form.dataNascimento.includes('/')) {
                const [dia, mes, ano] = form.dataNascimento.split('/');
                dataISO2 = new Date(`${ano}-${mes}-${dia}`).toISOString();
            } else if (form.dataNascimento) {
                dataISO2 = new Date(form.dataNascimento).toISOString();
            }

            if (pacienteExistente && pacienteExistente.id) {
                // Apenas atualizar listaEsperaTriagem para true
                await import('../../utils/api').then(({ atualizarPaciente }) =>
                    atualizarPaciente(pacienteExistente.id, { listaEsperaTriagem: true })
                );
                setMensagem('Paciente incluído na lista de espera para triagem!');
            } else {
                // Cadastrar novo paciente normalmente
                const pacientePayload = {
                    nome: form.nome,
                    cpf: form.cpf,
                    dataNascimento: dataISO2,
                    sexo: form.sexo,
                    endereco: form.endereco,
                    telefone: form.telefone,
                    prioridade: form.prioridade,
                    listaEsperaTriagem: true
                };
                await criarPaciente(pacientePayload);
                setMensagem('Paciente cadastrado e incluído na lista de espera para triagem!');
            }
            setForm({
                nome: '',
                cpf: '',
                dataNascimento: '',
                sexo: '',
                endereco: '',
                telefone: '',
                prioridade: 'Normal',
            });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setErro(err.response.data.error);
            } else {
                setErro('Erro ao cadastrar paciente e incluir na triagem');
            }
        }
    }

    return (
        <main className="cadastro-paciente" style={{maxWidth:480,margin:'0 auto',padding:'2rem 1rem'}}>
            <h1 style={{textAlign:'center',marginBottom:'1.5rem'}}>Cadastro de Paciente</h1>
            <form onSubmit={handleBuscarPaciente} style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'2rem',justifyContent:'center'}}>
                <input
                    type="text"
                    placeholder="Buscar por CPF"
                    value={buscaCpf}
                    onChange={e => setBuscaCpf(e.target.value)}
                    style={{width:'180px',padding:'0.5em',borderRadius:4,border:'1px solid #bbb'}}
                />
                <button type="submit" disabled={buscando} style={{padding:'0.5em 1.2em',borderRadius:4,background:'#1976d2',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}}>Buscar</button>
            </form>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem',background:'#f9f9f9',padding:'2rem',borderRadius:8,boxShadow:'0 2px 8px #0001'}}>
                <label htmlFor="nome">Nome completo:</label>
                <input 
                    type="text" 
                    name="nome" 
                    id="nome" 
                    value={form.nome} 
                    onChange={handleChange} 
                    required 
                    style={{padding:'0.5em',borderRadius:4,border:'1px solid #bbb'}}
                />

                <label htmlFor="cpf">CPF:</label>
                <input 
                    type="text"
                    name="cpf" 
                    id="cpf" 
                    value={form.cpf} 
                    onChange={handleChange} 
                    required 
                    style={{padding:'0.5em',borderRadius:4,border:'1px solid #bbb'}}
                />


                <label htmlFor="data-nascimento">Data de nascimento:</label>
                <input 
                    type="date" 
                    name="dataNascimento" 
                    id="data-nascimento" 
                    value={form.dataNascimento} 
                    onChange={handleChange} 
                    required 
                    style={{padding:'0.5em',borderRadius:4,border:'1px solid #bbb'}}
                />

                <label htmlFor="sexo">Sexo:</label>
                <select
                    name="sexo"
                    id="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    required
                    style={{padding:'0.5em',borderRadius:4,border:'1px solid #bbb',background:'#fff',color:'#222'}}
                >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                </select>

                <label htmlFor="endereco">Endereço:</label>
                <input 
                    type="text" 
                    name="endereco" 
                    id="endereco" 
                    value={form.endereco} 
                    onChange={handleChange} 
                    required 
                    style={{padding:'0.5em',borderRadius:4,border:'1px solid #bbb'}}
                />

                <label htmlFor="telefone">Telefone:</label>
                <input 
                    type="text" 
                    name="telefone" 
                    id="telefone" 
                    value={form.telefone} 
                    onChange={handleChange} 
                    required 
                    style={{padding:'0.5em',borderRadius:4,border:'1px solid #bbb'}}
                />

                <label>Prioridade de Atendimento:</label>
                <div className="prioridade">
                    <Prioridade
                        prioridade={form.prioridade}
                        onChange={handlePrioridade}
                    />
                </div>
                {mensagem && <div className="form-success" style={{color:'#388e3c',background:'#e8f5e9',padding:'0.5em 1em',borderRadius:4}}>{mensagem}</div>}
                {erro && <div className="form-error" style={{color:'#d32f2f',background:'#ffebee',padding:'0.5em 1em',borderRadius:4}}>{erro}</div>}
                <div style={{display:'flex',gap:'1rem',marginTop:'0.5rem',justifyContent:'center'}}>
                    <button type="submit" style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:6,padding:'0.7em 0',fontWeight:600,cursor:'pointer',boxShadow:'0 2px 8px #1976d233',minWidth:180}}>Salvar</button>
                    <button type="button" onClick={handleIncluirTriagem} style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:6,padding:'0.7em 0',fontWeight:600,cursor:'pointer',boxShadow:'0 2px 8px #1976d233',minWidth:180}}>Incluir na Triagem</button>
                </div>
            </form>
        </main>
    )
}