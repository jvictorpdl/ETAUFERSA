import React from 'react';
import styled from 'styled-components';
import { cores } from './estilos';

export interface Verificacao {
    ok: boolean;
    texto: string;
    detalhe?: string;
}

const Lista = styled.ul`
    list-style: none;
    margin-bottom: 16px;
    border: 1px solid ${cores.bordaSuave};
    border-radius: 8px;

    li {
        display: flex;
        gap: 10px;
        padding: 10px 16px;
        color: ${cores.textoForte};
        font-size: 14px;
        line-height: 20px;
    }

    li + li {
        border-top: 1px solid #F3F4F6;
    }

    small {
        display: block;
        color: ${cores.textoSuave};
        font-size: 13px;
    }
`;

const Marca = styled.span<{ $ok: boolean }>`
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    border-radius: 50%;
    background: ${(p) => (p.$ok ? cores.okFundo : cores.erroFundo)};
    color: ${(p) => (p.$ok ? cores.ok : cores.erro)};
    font-size: 13px;
    font-weight: 700;
`;

// Lista de verificações: uma linha por critério, com ✓ ou ✗, o valor e o limite
export default function Verificacoes({ itens, rotulo }: { itens: Verificacao[]; rotulo: string }) {
    return (
        <Lista aria-label={rotulo}>
            {itens.map((v) => (
                <li key={v.texto}>
                    <Marca $ok={v.ok} aria-label={v.ok ? 'atende' : 'não atende'}>{v.ok ? '✓' : '✗'}</Marca>
                    <span>
                        {v.texto}
                        {v.detalhe && <small>{v.detalhe}</small>}
                    </span>
                </li>
            ))}
        </Lista>
    );
}
