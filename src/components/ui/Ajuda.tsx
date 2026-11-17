import React, { useState } from 'react';
import styled from 'styled-components';
import { cores } from './estilos';

const Painel = styled.aside`
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media (min-width: 1024px) {
        position: sticky;
        top: 12px;
        align-self: start;
    }

    @media (max-width: 768px) {
        margin-top: 8px;
        border-top: 1px solid ${cores.bordaSuave};
    }
`;

const Titulo = styled.h3`
    color: ${cores.textoForte};
    font-size: 14px;
    font-weight: 500;

    @media (max-width: 768px) {
        display: none;
    }
`;

const BotaoRecolher = styled.button<{ $aberto: boolean }>`
    display: none;

    @media (max-width: 768px) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 44px;
        padding: 0;
        border: 0;
        background: transparent;
        color: ${cores.texto};
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;

        svg {
            transform: rotate(${(p) => (p.$aberto ? '180deg' : '0deg')});
            transition: transform 0.2s ease;
        }
    }
`;

const Itens = styled.div<{ $aberto: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;

    @media (max-width: 768px) {
        display: ${(p) => (p.$aberto ? 'flex' : 'none')};
        padding-bottom: 8px;
    }
`;

const Item = styled.details`
    summary {
        color: ${cores.principal};
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        list-style: none;
    }

    summary::-webkit-details-marker {
        display: none;
    }

    > div {
        margin-top: 6px;
        color: ${cores.texto};
        font-size: 13px;
        line-height: 19px;
    }

    > div p + p {
        margin-top: 6px;
    }
`;

// Coluna "Informações auxiliares": no celular vira uma seção recolhível embaixo dos campos
export function PainelAjuda({ children }: { children: React.ReactNode }) {
    const [aberto, setAberto] = useState(false);
    return (
        <Painel>
            <Titulo>Informações auxiliares</Titulo>
            <BotaoRecolher type="button" $aberto={aberto} aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
                Informações auxiliares
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </BotaoRecolher>
            <Itens $aberto={aberto}>{children}</Itens>
        </Painel>
    );
}

export function ItemAjuda({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <Item>
            <summary>{titulo}</summary>
            <div>{children}</div>
        </Item>
    );
}
