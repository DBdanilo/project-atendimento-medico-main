import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListaPacientes from '../../components/ListaPacientes'
import { getPacientes } from '../../utils/api'

import './Triagem.css'


export default function Triagem() {
    const [pacientes, setPacientes] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        atualizarLista();
    }, []);

    async function atualizarLista() {
        // Busca todos os pacientes e filtra os que não têm triagem
        const todos = await getPacientes();
        const pacientesSemTriagem = todos.filter(p => !p.triagem);
        setPacientes(pacientesSemTriagem);
    }

    function handleSelecionar(id) {
        navigate(`/triagem/${id}`);
    }

    return (
        <main className="triagem">
            <ListaPacientes
                pacientes={pacientes}
                onSelecionar={handleSelecionar}
                titulo="Lista de Espera para Triagem"
            />
        </main>
    )
}
