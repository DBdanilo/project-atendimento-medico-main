

import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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
import { useState, useEffect } from 'react';



function App() {
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [perfilUsuario, setPerfilUsuario] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('usuarioLogado');
        const perfil = localStorage.getItem('perfilUsuario');
        if (user) setUsuarioLogado(user);
        if (perfil) setPerfilUsuario(perfil);
    }, []);

    const handleLogin = (username) => {
        setUsuarioLogado(username);
        const perfil = localStorage.getItem('perfilUsuario');
        setPerfilUsuario(perfil);
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
        setPerfilUsuario(null);
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('perfilUsuario');
    };

    if (!usuarioLogado || !perfilUsuario) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <BrowserRouter>
            <Header handleLogout={handleLogout} />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/cadastro' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='cadastro'>
                        <CadastroPaciente />
                    </ProtectedRoute>
                } />
                <Route path='/triagem' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='triagem'>
                        <Triagem />
                    </ProtectedRoute>
                } />
                <Route path='/triagem/:id' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='triagem'>
                        <FormTriagem />
                    </ProtectedRoute>
                } />
                <Route path='/atendimento' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='atendimento'>
                        <Atendimento />
                    </ProtectedRoute>
                } />
                <Route path='/atendimento/:id' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='atendimento'>
                        <FormAtendimento />
                    </ProtectedRoute>
                } />
                <Route path='/painel' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='painel'>
                        <PainelSituacao />
                    </ProtectedRoute>
                } />
                <Route path='/funcionarios' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='funcionarios'>
                        <Funcionario />
                    </ProtectedRoute>
                } />
                <Route path='/relatorio' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='relatorio'>
                        <Relatorio />
                    </ProtectedRoute>
                } />
                <Route path='/prontuario' element={
                    <ProtectedRoute perfil={perfilUsuario} modulo='prontuario'>
                        <ProntuarioEletronico />
                    </ProtectedRoute>
                } />
                <Route path='*' element={<Navigate to='/' />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;