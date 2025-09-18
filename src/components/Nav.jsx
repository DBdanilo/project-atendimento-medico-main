
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faNotesMedical, faUserMd, faHome, faListAlt, faUsers, faChartBar, faFileMedical } from "@fortawesome/free-solid-svg-icons";
import './Nav.css';
import { permissoes } from '../utils/auth';

export default function Nav() {
    const perfil = localStorage.getItem('perfilUsuario');
    const mods = permissoes[perfil] || [];
    return (
        <nav className="menu-navegacao">
            {mods.includes('home') && (
                <Link to='/'><FontAwesomeIcon icon={faHome} />Home</Link>
            )}
            {mods.includes('cadastro') && (
                <Link to='/cadastro'><FontAwesomeIcon icon={faUserPlus} />Cadastro</Link>
            )}
            {mods.includes('triagem') && (
                <Link to='/triagem'><FontAwesomeIcon icon={faNotesMedical} /> Triagem</Link>
            )}
            {mods.includes('atendimento') && (
                <Link to='/atendimento'><FontAwesomeIcon icon={faUserMd} /> Atendimento</Link>
            )}
            {mods.includes('painel') && (
                <Link to='/painel'><FontAwesomeIcon icon={faListAlt} /> Painel</Link>
            )}
            {mods.includes('funcionarios') && (
                <Link to='/funcionarios'><FontAwesomeIcon icon={faUsers} /> Funcionários</Link>
            )}
            {mods.includes('relatorio') && (
                <Link to='/relatorio'><FontAwesomeIcon icon={faChartBar} /> Relatório</Link>
            )}
            {mods.includes('prontuario') && (
                <Link to='/prontuario'><FontAwesomeIcon icon={faFileMedical} /> Prontuário</Link>
            )}
        </nav>
    )
}