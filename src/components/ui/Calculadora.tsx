import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { cores, HorizontalSplitter, PageSubtitle, PageTitle } from './estilos';

const Cabecalho = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
`;

const BotaoLimpar = styled.button`
    flex: none;
    padding: 4px 8px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: ${cores.erro};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background: ${cores.erroFundo};
    }
`;

const Grupos = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
`;

// grupo atual em verde, clicáveis em cinza escuro, bloqueados em cinza claro
const BotaoGrupo = styled.button<{ $atual: boolean }>`
    padding: 4px 12px;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$atual ? cores.destaque : cores.borda)};
    background: #FFF;
    color: ${(p) => (p.$atual ? cores.principal : cores.texto)};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        color: ${(p) => (p.$atual ? cores.principal : '#9CA3AF')};
        cursor: default;
    }

    @media (max-width: 768px) {
        min-height: 44px;
    }
`;

const Corpo = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
`;

interface Props {
    titulo: string;
    descricao: string;
    grupos: string[];
    grupo: string;
    bloqueados?: string[];
    onGrupo: (g: string) => void;
    onLimpar?: () => void;
    children: React.ReactNode;
}

// Moldura de cada unidade no padrão do AutoDepura: título, descrição, botões de grupo e conteúdo
export default function Calculadora({ titulo, descricao, grupos, grupo, bloqueados = [], onGrupo, onLimpar, children }: Props) {
    const [confirmando, setConfirmando] = useState(false);
    const topo = useRef<HTMLDivElement>(null);

    // ao trocar de grupo a tela volta para o topo do cartão
    useEffect(() => {
        if (topo.current && topo.current.getBoundingClientRect().top < 0) {
            topo.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [grupo]);

    return (
        <Corpo ref={topo}>
            <Cabecalho>
                <div>
                    <PageTitle>{titulo}</PageTitle>
                    <PageSubtitle>{descricao}</PageSubtitle>
                </div>
                {onLimpar && (confirmando
                    ? <span>
                        <BotaoLimpar type="button" onClick={() => { setConfirmando(false); onLimpar(); }}>Confirmar limpeza</BotaoLimpar>
                        <BotaoLimpar type="button" style={{ color: cores.texto }} onClick={() => setConfirmando(false)}>Cancelar</BotaoLimpar>
                    </span>
                    : <BotaoLimpar type="button" onClick={() => setConfirmando(true)}>Limpar dados</BotaoLimpar>)}
            </Cabecalho>
            <Grupos>
                {grupos.map((g) => (
                    <BotaoGrupo
                        key={g}
                        type="button"
                        $atual={g === grupo}
                        aria-current={g === grupo ? 'step' : undefined}
                        disabled={g === grupo || bloqueados.includes(g)}
                        onClick={() => onGrupo(g)}
                    >
                        {g}
                    </BotaoGrupo>
                ))}
            </Grupos>
            <HorizontalSplitter />
            {children}
        </Corpo>
    );
}
