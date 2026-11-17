import React, { useState } from 'react';
import styled from 'styled-components';
import { cores } from './estilos';

const FieldWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;

    /* no celular rótulo e campo dividem a linha; abaixo de 360 px o campo desce */
    @media (min-width: 360px) and (max-width: 768px) {
        display: grid;
        grid-template-columns: 120px minmax(0, 1fr);
        align-items: center;
        column-gap: 8px;

        > p {
            grid-column: 1 / -1;
        }
    }
`;

const LabelWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;

    label {
        font-weight: 600;
        color: ${cores.textoForte};
    }

    @media (max-width: 768px) {
        min-height: 44px;
    }
`;

const BotaoInfo = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: ${cores.textoSuave};
    cursor: pointer;

    &:hover {
        color: ${cores.principal};
    }

    &:focus-visible {
        outline: 2px solid ${cores.principal};
    }
`;

const InputWrapper = styled.div<{ $invalido?: boolean }>`
    display: flex;
    align-items: center;
    border: 1px solid ${(p) => (p.$invalido ? cores.erro : cores.borda)};
    border-radius: 0.375rem;
    background: #fff;
    box-shadow: ${(p) => (p.$invalido ? `0 0 0 1px ${cores.erro}` : 'none')};

    &:focus-within {
        border-color: ${(p) => (p.$invalido ? cores.erro : cores.principal)};
        box-shadow: 0 0 0 1px ${(p) => (p.$invalido ? cores.erro : cores.principal)};
    }
`;

const Input = styled.input`
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0.5rem 0.75rem;
    border: 0;
    border-radius: 0.375rem;
    background: transparent;
    color: ${cores.textoForte};
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    outline: none;

    /* abaixo de 16 px o Safari do iPhone dá zoom ao focar o campo */
    @media (max-width: 768px) {
        height: 44px;
        font-size: 16px;
    }
`;

const Selecao = styled.select`
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 0.75rem;
    border: 0;
    border-radius: 0.375rem;
    background: transparent;
    color: ${cores.textoForte};
    font-size: 0.875rem;
    outline: none;

    @media (max-width: 768px) {
        height: 44px;
        font-size: 16px;
    }
`;

const UnidadeCampo = styled.span`
    padding: 0 0.75rem 0 0.25rem;
    font-size: 0.875rem;
    color: ${cores.textoSuave};
    white-space: nowrap;
`;

const TextoDica = styled.p`
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 18px;
    color: ${cores.texto};
`;

let contador = 0;
const novoId = () => `campo-${++contador}`;

function Rotulo({ id, rotulo, dica, onDica }: { id: string; rotulo: React.ReactNode; dica?: string; onDica: () => void }) {
    return (
        <LabelWrapper>
            <label htmlFor={id}>{rotulo}</label>
            {dica &&
                <BotaoInfo type="button" title={dica} aria-label={`Sobre ${typeof rotulo === 'string' ? rotulo : 'o campo'}: ${dica}`} onClick={onDica}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                    </svg>
                </BotaoInfo>}
        </LabelWrapper>
    );
}

interface CampoProps {
    rotulo: React.ReactNode;
    nome: string;
    valor: string;
    unidade?: string;
    dica?: string;
    invalido?: boolean;
    onChange: (valor: string) => void;
}

// Campo numérico: aceita vírgula ou ponto e mostra a unidade dentro da caixa, sempre visível
export function Campo({ rotulo, nome, valor, unidade, dica, invalido, onChange }: CampoProps) {
    const [id] = useState(novoId);
    const [dicaAberta, setDicaAberta] = useState(false);
    return (
        <FieldWrapper>
            <Rotulo id={id} rotulo={rotulo} dica={dica} onDica={() => setDicaAberta(!dicaAberta)} />
            <InputWrapper $invalido={invalido}>
                <Input
                    id={id}
                    name={nome}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={invalido || undefined}
                    aria-describedby={unidade ? `${id}-un` : undefined}
                    value={valor}
                    onChange={(e) => {
                        const v = e.target.value.replace('.', ',');
                        if (/^\d*,?\d*$/.test(v)) onChange(v);
                    }}
                />
                {unidade && <UnidadeCampo id={`${id}-un`}>{unidade}</UnidadeCampo>}
            </InputWrapper>
            {dicaAberta && dica && <TextoDica>{dica}</TextoDica>}
        </FieldWrapper>
    );
}

interface CampoSelecaoProps {
    rotulo: React.ReactNode;
    nome: string;
    valor: string;
    opcoes: Array<{ valor: string; texto: string }>;
    dica?: string;
    invalido?: boolean;
    vazio?: string;
    onChange: (valor: string) => void;
}

export function CampoSelecao({ rotulo, nome, valor, opcoes, dica, invalido, vazio, onChange }: CampoSelecaoProps) {
    const [id] = useState(novoId);
    const [dicaAberta, setDicaAberta] = useState(false);
    return (
        <FieldWrapper>
            <Rotulo id={id} rotulo={rotulo} dica={dica} onDica={() => setDicaAberta(!dicaAberta)} />
            <InputWrapper $invalido={invalido}>
                <Selecao id={id} name={nome} value={valor} aria-invalid={invalido || undefined} onChange={(e) => onChange(e.target.value)}>
                    {vazio !== undefined && <option value="">{vazio}</option>}
                    {opcoes.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                </Selecao>
            </InputWrapper>
            {dicaAberta && dica && <TextoDica>{dica}</TextoDica>}
        </FieldWrapper>
    );
}
