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
			<div style={{width:'100%',maxWidth:370,padding:'2.5rem 2rem',background:'#fff',borderRadius:18,boxShadow:'0 6px 32px rgba(25,118,210,0.13),0 2px 8px rgba(0,0,0,0.07)',display:'flex',flexDirection:'column',alignItems:'center',gap:'1.2rem'}}>
				<div className="login-brand" style={{display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'0.5rem'}}>
					<svg style={{height:'2.3rem',marginRight:'0.4rem'}} viewBox="0 0 24 24" fill="#1976d2" width="2em" height="2em"><circle cx="12" cy="12" r="10" fill="#e3f0ff"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#1976d2"/></svg>
					<span style={{color:'#1976d2',fontWeight:900,letterSpacing:'1.5px',fontSize:'2rem'}}>Avanti <span style={{color:'#d32f2f'}}>+ Saúde</span></span>
				</div>
				<form className="login-form" style={{width:'100%',display:'flex',flexDirection:'column',gap:'1.1rem'}} onSubmit={handleSubmit}>
					<h2 style={{color:'#1976d2',fontWeight:700,letterSpacing:'1px',marginBottom:'0.5rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',fontSize:'1.5rem'}}>
						<span className="login-icon" role="img" aria-label="login" style={{color:'#1976d2',fontSize:'1.3rem'}}>🔒</span>
						Login
					</h2>
					<input
						type="text"
						placeholder="CPF"
						value={username}
						onChange={e => setUsername(e.target.value)}
						autoFocus
						style={{borderColor:'#1976d2',background:'#f7faff',color:'#1a237e',borderRadius:7,padding:'0.85rem',fontSize:'1.08rem'}}
					/>
					<input
						type="password"
						placeholder="Senha"
						value={password}
						onChange={e => setPassword(e.target.value)}
						style={{borderColor:'#1976d2',background:'#f7faff',color:'#1a237e',borderRadius:7,padding:'0.85rem',fontSize:'1.08rem'}}
					/>
					{error && <div className="login-error" style={{marginTop:'-0.5rem',background:'#ffeaea',color:'#d32f2f',borderRadius:4,padding:'0.4rem 0.6rem',textAlign:'center'}}>{error}</div>}
					<button type="submit" style={{background:'linear-gradient(90deg,#1976d2 60%,#2196f3 100%)',color:'#fff',fontWeight:600,borderRadius:7,padding:'0.85rem',fontSize:'1.08rem',marginTop:'0.2rem'}}>Entrar</button>
				</form>
				<div style={{marginTop:'1.2rem',textAlign:'center',color:'#8ca0c7',fontSize:'1rem'}}>Bem-vindo ao sistema de atendimento médico Avanti + Saúde</div>
			</div>
		</div>
	);
}
