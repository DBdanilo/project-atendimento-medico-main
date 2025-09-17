
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faNotesMedical, faUserMd, faHome, faListAlt, faUsers, faChartBar, faFileMedical } from "@fortawesome/free-solid-svg-icons";
import './Nav.css';


export default function Nav() {
    return (
        <nav className="menu-navegacao">
            <Link to='/'><FontAwesomeIcon icon={faHome} />Home</Link>

            <Link to='/cadastro'><FontAwesomeIcon icon={faUserPlus} />Cadastro</Link>

            <Link to='/triagem'><FontAwesomeIcon icon={faNotesMedical} /> Triagem</Link>

            <Link to='/atendimento'><FontAwesomeIcon icon={faUserMd} /> Atendimento</Link>
            
            <Link to='/painel'><FontAwesomeIcon icon={faListAlt} /> Painel</Link>

            <Link to='/funcionarios'><FontAwesomeIcon icon={faUsers} /> Funcionários</Link>


            <Link to='/relatorio'><FontAwesomeIcon icon={faChartBar} /> Relatório</Link>
            <Link to='/prontuario'><FontAwesomeIcon icon={faFileMedical} /> Prontuário</Link>
        </nav>
    )
}