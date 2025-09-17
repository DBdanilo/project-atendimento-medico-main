import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListaPacientes from '../../components/ListaPacientes'
import { getPacientes } from '../../utils/api'

import './Atendimento.css'


export default function Atendimento() {
    const [pacientes, setPacientes] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        atualizarLista()
    }, [])

    async function atualizarLista() {
        // Busca pacientes que já têm triagem (ou triagens) e ainda não têm atendimento
        const todos = await getPacientes();
        const pacientesEmEspera = todos.filter(p => (p.triagens && p.triagens.length > 0) && (!p.atendimentos || p.atendimentos.length === 0));
        setPacientes(pacientesEmEspera);
    }

    function handleSelecionar(id) {
        const paciente = pacientes.find(p => p.id === id)

        if (!paciente) return

        navigate(`/atendimento/${id}`)
    }



    return (
        <main className="atendimento">
            <ListaPacientes
                pacientes={pacientes}
                onSelecionar={handleSelecionar}
                titulo="Lista de Atendimento Médico"
            />
        </main>
    )
}