import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

// Quatro links: cabem na barra em qualquer largura, sem menu escondido no celular
const Nav = styled.nav`
    width: 100%;
    display: flex;
    justify-content: center;
`

const Lista = styled.ul`
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 8px;
    width: 100%;
    max-width: 650px;
    padding: 0 16px;
    @media(min-width: 768px){
        justify-content: space-between;
    }
`

const Link = styled(NavLink)`
    display: block;
    padding: 10px 12px;
    color: var(--branco);
    text-decoration: none;
    font-size: 16px;
    border-radius: 6px;
    &:hover,
    &:focus-visible {
        background-color: rgba(255, 255, 255, 0.15);
    }
    &.ativo {
        background-color: rgba(255, 255, 255, 0.22);
        font-weight: 500;
    }
    @media(min-width: 1000px){
        font-size: 18px;
    }
`

const PAGINAS = [
    { para: '/coagulacao', nome: 'Coagulação' },
    { para: '/floculacao', nome: 'Floculação' },
    { para: '/decantacao', nome: 'Decantação' },
    { para: '/filtracao', nome: 'Filtração' },
];

export default function Menu() {
    return (
        <Nav aria-label="Unidades da ETA">
            <Lista>
                {PAGINAS.map((p) => (
                    <li key={p.para}>
                        <Link
                            to={p.para}
                            className="MenuLink"
                            activeClassName="ativo"
                            isActive={(_, local) => local.pathname === p.para || (p.para === '/coagulacao' && local.pathname === '/')}
                        >
                            {p.nome}
                        </Link>
                    </li>
                ))}
            </Lista>
        </Nav>
    );
}
