
import { BrowserRouter, Form, Route, Routes, Link } from 'react-router-dom'
import { Home } from './pages/home/Home'
import Header from './components/Header'
import Footer from './components/Footer'
import CadastroPaciente from './pages/cadastro/CadastroPaciente'
import Triagem from './pages/triagem/Triagem'
import FormTriagem from './pages/triagem/FormTriagem'
import Atendimento from './pages/atendimento/Atendimento'
import FormAtendimento from './pages/atendimento/FormAtendimento'
import PainelSituacao from './pages/painel/PainelSituacao'
import CadastroFuncionario from './pages/CadastroFuncionario'
import ListaFuncionarios from './pages/ListaFuncionarios'
//import SintuacaoPaciente from './components/SintuacaoPaciente'

import './App.css'


function App() {

    return (
        <BrowserRouter>
            <Header />

            {/* Menu extra para acesso rápido aos módulos de funcionário */}
            <nav style={{ margin: '1rem' }}>
                <Link to="/cadastro-funcionario" style={{ marginRight: 10 }}>Cadastro de Funcionário</Link>
                <Link to="/lista-funcionarios">Lista de Funcionários</Link>
            </nav>

            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/cadastro' element={<CadastroPaciente />} />
                <Route path='/triagem' element={<Triagem />} />
                <Route path='/triagem/:id' element={<FormTriagem />} />
                <Route path='/atendimento' element={<Atendimento />} />
                <Route path='/atendimento/:id' element={<FormAtendimento />} />
                {/* <Route path='/paciente/:id' element={<SintuacaoPaciente />} /> */}
                <Route path='/painel' element={<PainelSituacao />} />
                <Route path='/cadastro-funcionario' element={<CadastroFuncionario />} />
                <Route path='/lista-funcionarios' element={<ListaFuncionarios />} />
            </Routes>

            <Footer />
        </BrowserRouter>
    )
}

export default App