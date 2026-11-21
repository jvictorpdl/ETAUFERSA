import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import logoFaceu from '../../assets/logo-faceu.png';
import { cores } from './estilos';

const Fundo = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${cores.fundo};
`;

const Cabecalho = styled.header`
    display: flex;
    align-items: center;
    height: 80px;
    padding: 0 16px;
    background: #FFF;
    box-shadow: 0 4px 13px 0 rgba(0, 0, 0, 0.08);

    img {
        display: block;
        height: 40px;
        width: auto;
    }

    @media (max-width: 768px) {
        height: 56px;

        img {
            height: 32px;
        }
    }
`;

const Conteudo = styled.main`
    flex: 1;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px 32px;

    /* a folga no fim é para a barra fixa de botões não cobrir o conteúdo */
    @media (max-width: 768px) {
        padding: 0 16px 96px;
    }
`;

const NomeApp = styled.h1`
    margin-top: 32px;
    color: #4F5666;
    font-size: 32px;
    font-weight: 700;

    @media (max-width: 768px) {
        margin-top: 12px;
        font-size: 24px;
        line-height: 32px;
    }
`;

const Abas = styled.nav`
    display: flex;
    gap: 2rem;
    margin-top: 16px;
    border-bottom: 1px solid #DCE3EB;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 768px) {
        gap: 1.25rem;
    }
`;

const Aba = styled(NavLink)`
    flex: none;
    padding: 1rem 0;
    border-bottom: 2px solid transparent;
    color: ${cores.texto};
    font-size: 16px;
    font-weight: 400;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: ${cores.principal};
    }

    &.ativa {
        border-bottom-color: ${cores.principal};
        color: ${cores.principal};
        font-weight: 600;
    }

    @media (max-width: 768px) {
        padding: 0.75rem 0;
    }
`;

export const Cartao = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 560px;
    margin-top: 24px;
    padding: 24px;
    border-radius: 6px;
    background: #FFF;
    box-shadow: 0 0 24px 0 rgba(46, 60, 88, 0.10);

    @media (max-width: 768px) {
        margin-top: 12px;
        padding: 16px;
        min-height: 0;
    }
`;

const Rodape = styled.footer`
    padding: 16px 24px 24px;
    color: ${cores.textoSuave};
    font-size: 13px;
    text-align: center;

    @media (max-width: 768px) {
        padding-bottom: 88px;
    }
`;

const UNIDADES = [
    { para: '/coagulacao', nome: 'Coagulação' },
    { para: '/floculacao', nome: 'Floculação' },
    { para: '/decantacao', nome: 'Decantação' },
    { para: '/filtracao', nome: 'Filtração' },
];

export default function Layout({ unidade, children }: { unidade: string; children: React.ReactNode }) {
    // o título da aba do navegador acompanha a unidade aberta
    useEffect(() => {
        document.title = `${unidade} · ETA UFERSA`;
    }, [unidade]);

    // no celular as abas rolam na horizontal; a aba aberta fica sempre à vista
    const abas = useRef<HTMLElement>(null);
    useEffect(() => {
        const ativa = abas.current?.querySelector<HTMLElement>('.ativa');
        const faixa = abas.current;
        if (ativa && faixa && faixa.scrollWidth > faixa.clientWidth) {
            faixa.scrollLeft = ativa.offsetLeft - (faixa.clientWidth - ativa.offsetWidth) / 2;
        }
    }, [unidade]);

    return (
        <Fundo>
            <Cabecalho>
                <a href="/" aria-label="ETA UFERSA, página inicial">
                    <img src={logoFaceu} alt="FACEU" />
                </a>
            </Cabecalho>
            <Conteudo>
                <NomeApp>ETA UFERSA</NomeApp>
                <Abas ref={abas} aria-label="Unidades da ETA">
                    {UNIDADES.map((u) => (
                        <Aba
                            key={u.para}
                            to={u.para}
                            activeClassName="ativa"
                            isActive={(_, local) => local.pathname === u.para || (u.para === '/coagulacao' && local.pathname === '/')}
                        >
                            {u.nome}
                        </Aba>
                    ))}
                </Abas>
                <Cartao>{children}</Cartao>
            </Conteudo>
            <Rodape>
                ETA UFERSA: pré-dimensionamento de unidades de estação de tratamento de água · FACEU · Universidade Federal Rural do Semi-Árido
            </Rodape>
        </Fundo>
    );
}
