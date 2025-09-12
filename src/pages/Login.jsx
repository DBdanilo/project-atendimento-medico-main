

import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Usuário geral para testes: geral/geral
    if (
      (username === 'admin' && password === '1234') ||
      (username === 'geral' && password === 'geral')
    ) {
      setError('');
      if (onLogin) onLogin(username);
      localStorage.setItem('usuarioLogado', username);
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-brand">
        <svg style={{height:'2.1rem',marginRight:'0.4rem'}} viewBox="0 0 24 24" fill="#d32f2f" width="1.8em" height="1.8em"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        Avanti + Saúde
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>
          <span className="login-icon" role="img" aria-label="login">🔒</span>
          Login
        </h2>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="login-error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
