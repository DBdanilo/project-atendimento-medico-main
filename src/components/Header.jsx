
import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

import './Header.css';


export default function Header() {
    // Busca nome e perfil do usuário logado
    const [dadosLogado, setDadosLogado] = React.useState({ nome: '', perfil: '' });
    React.useEffect(() => {
        const id = localStorage.getItem('usuarioId');
        if (id) {
            import('../utils/api').then(({ getFuncionarios }) => {
                getFuncionarios().then(funcs => {
                    const logado = funcs.find(f => String(f.id) === String(id));
                    if (logado) setDadosLogado({ nome: logado.nome, perfil: logado.perfil });
                });
            });
        }
    }, []);

        return (
            <header className="header" style={{position:'relative'}}>
                <h1 style={{display:'flex',alignItems:'center',gap:'1.2rem'}}>
                        Avanti
                    <span style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',width:'2.8rem',height:'2.8rem',marginLeft:'1.2rem',marginRight:'0.2rem'}}>
                        <FontAwesomeIcon icon={faHeart} className="gentle-pulse header-icon" style={{fontSize:'2.8rem',color:'#1976d2',verticalAlign:'middle'}} />
                        <span style={{position:'absolute',top:'42%',left:'32%',transform:'translate(-50%,-56%)',color:'#fff',fontWeight:900,fontSize:'3rem',pointerEvents:'none',lineHeight:'1'}}>+</span>
                    </span>
                    Saúde
                </h1>
                <span className="header-user-info">
                    {dadosLogado.nome && dadosLogado.perfil ? (
                        <span className="user-pill">
                            <span className="user-name">{dadosLogado.nome}</span>
                            <span className="user-sep">|</span>
                            <span className="user-perfil">{dadosLogado.perfil}</span>
                        </span>
                    ) : ''}
                </span>
                <hr />
                <Nav />
            </header>
        )
}