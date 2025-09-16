

import React, { useState } from 'react';
import { login } from '../../utils/api';
import './Login.css';

export default function Login({ onLogin }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			const res = await login(username, password);
			if (onLogin) onLogin(res.nome);
			localStorage.setItem('token', res.token);
			localStorage.setItem('usuarioLogado', res.nome);
			if (res.id) {
				localStorage.setItem('usuarioId', res.id);
			}
		} catch (err) {
			setError('Usuário ou senha inválidos');
		}
	};

	return (
		<div className="login-container" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(120deg,#e3f0ff 0%,#f8fcff 100%)'}}>
			<div style={{width:'100%',maxWidth:400,padding:'2.5rem 2rem',background:'#fff',borderRadius:20,boxShadow:'0 8px 32px rgba(25,118,210,0.13),0 2px 8px rgba(0,0,0,0.07)',display:'flex',flexDirection:'column',alignItems:'center',gap:'1.5rem'}}>
				<div style={{width:'100%',display:'flex',justifyContent:'center',alignItems:'center',marginBottom:'0.5rem'}}>
					<img src="/logofinal.png" alt="Logo Avanti + Saúde" style={{height:'18rem',objectFit:'contain',maxWidth:'80%',marginBottom:'0.2rem'}} />
				</div>
				<form className="login-form" style={{width:'100%',display:'flex',flexDirection:'column',gap:'1.2rem',marginTop:'0'}} onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="CPF"
						value={username}
						onChange={e => setUsername(e.target.value)}
						autoFocus
						style={{borderColor:'#1976d2',background:'#f7faff',color:'#1a237e',borderRadius:8,padding:'1rem',fontSize:'1.1rem'}}
					/>
					<input
						type="password"
						placeholder="Senha"
						value={password}
						onChange={e => setPassword(e.target.value)}
						style={{borderColor:'#1976d2',background:'#f7faff',color:'#1a237e',borderRadius:8,padding:'1rem',fontSize:'1.1rem'}}
					/>
					{error && <div className="login-error" style={{marginTop:'-0.5rem',background:'#ffeaea',color:'#d32f2f',borderRadius:5,padding:'0.5rem 0.7rem',textAlign:'center'}}>{error}</div>}
					<button type="submit" style={{background:'linear-gradient(90deg,#1976d2 60%,#2196f3 100%)',color:'#fff',fontWeight:600,borderRadius:8,padding:'1rem',fontSize:'1.1rem',marginTop:'0.2rem'}}>Entrar</button>
				</form>
				<div style={{marginTop:'1.5rem',textAlign:'center',color:'#8ca0c7',fontSize:'1.05rem'}}>Bem-vindo ao sistema de atendimento médico Avanti + Saúde</div>
			</div>
		</div>
	);
}
