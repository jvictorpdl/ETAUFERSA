// Componentes visuais no padrão do AutoDepura (Calimpe-H20), para as ferramentas da FACEU
// terem a mesma cara: Inter, verde-petróleo #17737A, cartão branco sobre fundo #F1F8FF.
import styled from 'styled-components';

export const cores = {
    principal: '#17737A',
    principalEscuro: '#125E64',
    principalClaro: '#F0F9FA',
    destaque: '#2BA3AB',
    fundo: '#F1F8FF',
    textoForte: '#374151',
    texto: '#4B5563',
    textoSuave: '#6B7280',
    borda: '#D1D5DB',
    bordaSuave: '#E5E7EB',
    erro: '#B91C1C',
    erroFundo: '#FEF2F2',
    erroBorda: '#FCA5A5',
    ok: '#047857',
    okFundo: '#ECFDF5',
    okBorda: '#6EE7B7',
    alerta: '#92400E',
    alertaFundo: '#FFFBEB',
    alertaBorda: '#FCD34D',
};

export const PageTitle = styled.h2`
    color: ${cores.textoForte};
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;

    @media (max-width: 768px) {
        font-size: 18px;
        line-height: 24px;
    }
`;

export const PageSubtitle = styled.p`
    margin-top: 4px;
    color: ${cores.texto};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
`;

export const FormTitle = styled.h3`
    margin-bottom: 16px;
    color: ${cores.textoForte};
    font-size: 18px;
    font-weight: 600;
    line-height: 28px;

    @media (max-width: 768px) {
        font-size: 16px;
        line-height: 24px;
        margin-bottom: 8px;
    }
`;

export const Secao = styled.section`
    & + & {
        margin-top: 24px;
    }
`;

export const Column = styled.div`
    display: flex;
    flex-direction: column;
`;

// campos ocupam o espaço que sobra; a coluna de ajuda (a última) tem largura fixa
export const Row = styled.div`
    display: flex;
    gap: 8px;

    > ${Column}:first-child {
        flex: 1 1 0;
        min-width: 0;
    }

    > ${Column}:last-child:not(:first-child) {
        flex: 0 0 280px;
    }

    @media (max-width: 900px) {
        flex-wrap: wrap;

        > ${Column}, > ${Column}:first-child, > ${Column}:last-child:not(:first-child) {
            flex: 1 1 100%;
            min-width: 0;
        }
    }
`;

export const Grid = styled.div<{ $colunas?: number }>`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(max(168px, calc((100% - ${(p) => (p.$colunas ?? 4) - 1}rem) / ${(p) => p.$colunas ?? 4} - 0.1px)), 1fr));
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
    }
`;

export const HorizontalSplitter = styled.div`
    height: 1px;
    margin: 16px 0;
    background: #5c5c5c28;
`;

export const VerticalSplitter = styled.div`
    width: 1px;
    margin: 0 16px;
    background: #5c5c5c28;

    @media (max-width: 900px) {
        display: none;
    }
`;

export const ActionButton = styled.button`
    border-radius: 8px;
    border: 1px solid ${cores.principal};
    color: #FFF;
    font-weight: 600;
    background: ${cores.principal};
    padding: 12px 16px;
    font-size: 14px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: ${cores.principalEscuro};
    }

    &:disabled {
        border-color: ${cores.borda};
        background: #F3F4F6;
        color: #9CA3AF;
        cursor: default;
    }
`;

export const CancelButton = styled.button`
    border-radius: 8px;
    border: 1px solid ${cores.borda};
    background: #FFF;
    color: ${cores.texto};
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        border-color: ${cores.principal};
        color: ${cores.principal};
    }
`;

// no celular os botões ficam sempre à mão, presos ao rodapé da tela
export const BarraAcoes = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 24px;

    @media (max-width: 768px) {
        position: fixed;
        z-index: 10;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 8px 16px;
        background: #FFF;
        box-shadow: 0 -4px 13px 0 rgba(0, 0, 0, 0.08);

        > button {
            flex: 1;
            min-height: 48px;
            font-size: 16px;
        }

        > ${ActionButton} {
            flex: 2;
        }
    }
`;

export const MensagemErro = styled.div`
    margin-bottom: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${cores.erroBorda};
    background: ${cores.erroFundo};
    color: ${cores.erro};
    font-size: 14px;
    line-height: 1.5;
`;

export const Conclusao = styled.div<{ $atende: boolean }>`
    margin-bottom: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$atende ? cores.okBorda : cores.erroBorda)};
    background: ${(p) => (p.$atende ? cores.okFundo : cores.erroFundo)};
    color: ${cores.textoForte};
    font-size: 14px;
    line-height: 1.5;

    strong {
        display: block;
        font-size: 16px;
        color: ${(p) => (p.$atende ? cores.ok : cores.erro)};
    }
`;

export const Aviso = styled.div`
    margin-bottom: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${cores.alertaBorda};
    background: ${cores.alertaFundo};
    color: ${cores.alerta};
    font-size: 14px;
    line-height: 1.5;
`;

// ações secundárias (baixar relatório e desenho): contorno, texto verde
export const BotaoSecundario = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid ${cores.borda};
    border-radius: 8px;
    background: #FFF;
    color: ${cores.principal};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
        border-color: ${cores.principal};
        background: ${cores.principalClaro};
    }

    @media (max-width: 768px) {
        flex: 1 1 130px;
        min-height: 44px;
    }
`;

export const Botoes = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

export const TituloBloco = styled.h3`
    margin-bottom: 8px;
    color: ${cores.textoForte};
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
`;

export const Bloco = styled.section`
    margin-bottom: 16px;
`;

// destaque dos dois ou três resultados principais de cada unidade
export const Destaques = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }
`;

export const Destaque = styled.div`
    padding: 12px 16px;
    border: 1px solid ${cores.bordaSuave};
    border-radius: 8px;

    span {
        display: block;
        color: ${cores.textoSuave};
        font-size: 13px;
        font-weight: 500;
    }

    strong {
        display: block;
        margin-top: 2px;
        color: ${cores.textoForte};
        font-size: 22px;
        font-weight: 700;

        @media (max-width: 768px) {
            font-size: 18px;
        }
        font-variant-numeric: tabular-nums;
    }

    small {
        color: ${cores.textoSuave};
        font-size: 14px;
        font-weight: 500;
    }
`;

export const CaixaTabela = styled.div<{ $estreita?: boolean }>`
    max-width: ${(p) => (p.$estreita ? '720px' : 'none')};
    overflow-x: auto;
    margin-bottom: 16px;
    border: 1px solid ${cores.bordaSuave};
    border-radius: 8px;
`;

export const Tabela = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: ${cores.textoForte};

    caption {
        padding: 12px 16px 8px;
        text-align: left;
        font-size: 16px;
        font-weight: 600;
    }

    th, td {
        padding: 8px 12px;
        border-bottom: 1px solid #F3F4F6;
    }

    thead th {
        background: ${cores.principal};
        color: #FFF;
        text-align: right;
        white-space: nowrap;
        font-weight: 600;
    }

    thead th:first-child {
        text-align: left;
    }

    tbody th {
        text-align: left;
        font-weight: 600;
    }

    td {
        text-align: right;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }

    tbody tr:nth-child(even) th, tbody tr:nth-child(even) td {
        background: #F9FAFB;
    }

    td.fora {
        color: ${cores.erro};
        font-weight: 600;
    }

    @media (max-width: 768px) {
        font-size: 13px;

        th, td {
            padding: 6px 8px;
        }
    }
`;

export const Unidade = styled.span`
    font-weight: 400;
    color: ${cores.textoSuave};
`;

export const Descricao = styled.span`
    display: block;
    font-size: 12px;
    font-weight: 400;
    color: ${cores.textoSuave};
`;

export const Recolhivel = styled.details`
    margin-bottom: 16px;
    border: 1px solid ${cores.bordaSuave};
    border-radius: 8px;

    summary {
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 600;
        color: ${cores.textoForte};
        cursor: pointer;
    }

    > div {
        padding: 0 16px 12px;
    }

    @media (max-width: 768px) {
        summary {
            min-height: 44px;
        }
    }
`;

export const Paragrafo = styled.p`
    color: ${cores.texto};
    font-size: 14px;
    line-height: 20px;

    & + & {
        margin-top: 8px;
    }
`;
