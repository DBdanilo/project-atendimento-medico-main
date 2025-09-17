

import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Home } from './pages/home/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import CadastroPaciente from './pages/cadastro/CadastroPaciente';
import Triagem from './pages/triagem/Triagem';
import FormTriagem from './pages/triagem/FormTriagem';
import Atendimento from './pages/atendimento/Atendimento';
import FormAtendimento from './pages/atendimento/FormAtendimento';
import PainelSituacao from './pages/painel/PainelSituacao';
import Funcionario from './pages/funcionario/Funcionario';
import Relatorio from './pages/relatorio/Relatorio';
import ProntuarioEletronico from './pages/prontuario/ProntuarioEletronico';
import Login from './pages/login/Login';
import './App.css';
import './AppSairButton.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';



function App() {
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('usuarioLogado');
        if (user) setUsuarioLogado(user);
    }, []);

    const handleLogin = (username) => {
        setUsuarioLogado(username);
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
        localStorage.removeItem('usuarioLogado');
    };

    if (!usuarioLogado) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <BrowserRouter>
            <Header />
            <button className="btn-sair-app" onClick={handleLogout}>
                <span className="icon-sair">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </span>
                Sair
            </button>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/cadastro' element={<CadastroPaciente />} />
                <Route path='/triagem' element={<Triagem />} />
                <Route path='/triagem/:id' element={<FormTriagem />} />
                <Route path='/atendimento' element={<Atendimento />} />
                <Route path='/atendimento/:id' element={<FormAtendimento />} />
                <Route path='/painel' element={<PainelSituacao />} />
                <Route path='/funcionarios' element={<Funcionario />} />
                <Route path='/relatorio' element={<Relatorio />} />
                <Route path='/prontuario' element={<ProntuarioEletronico />} />
                <Route path='*' element={<Navigate to='/' />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;