import React, { useRef, useState } from 'react';
import { criteriosFiltracao } from '../../Utils/criterios';
import Layout from '../../components/ui/Layout';
import Calculadora from '../../components/ui/Calculadora';
import { Campo } from '../../components/ui/Campo';
import { ItemAjuda, PainelAjuda } from '../../components/ui/Ajuda';
import Desenho, { baixarPng } from '../../components/ui/Desenho';
import Verificacoes, { Verificacao } from '../../components/ui/Verificacoes';
import useDados from '../../components/ui/useDados';
import { lerNumero, numero } from '../../components/ui/formato';
import {
    ActionButton, BarraAcoes, Bloco, Botoes, BotaoSecundario, CaixaTabela, CancelButton, Column, Conclusao,
    Descricao, Destaque, Destaques, FormTitle, Grid, MensagemErro, Paragrafo, Row, Secao, Tabela, TituloBloco, Unidade, VerticalSplitter,
} from '../../components/ui/estilos';
import imgDesenho from '../../assets/images/exemploFilt.png';
import { calcularFiltr, EntradaFiltr } from './calculo';
import { relatorioFiltracao } from './relatorio';

interface Def { nome: string; rotulo: string; unidade?: string; dica: string; inteiro?: boolean }

const GERAIS: Def[] = [
    { nome: 'q', rotulo: 'Q', unidade: 'm³/s', dica: 'Vazão total da ETA.' },
    { nome: 'taxa', rotulo: 'Taxa de filtração', unidade: 'm³/m²·dia', dica: 'Sem filtro-piloto, a NBR 12216 limita a 360 m³/m²·dia em camada dupla.' },
    { nome: 'nd', rotulo: 'Nº de decantadores', dica: 'O número de filtros é pelo menos o dobro do número de decantadores.', inteiro: true },
    { nome: 'ldec', rotulo: 'Largura do decantador', unidade: 'm', dica: 'Os filtros ficam lado a lado na largura do decantador; define a dimensão L do filtro.' },
    { nome: 'lcalha', rotulo: 'Largura da calha de lavagem', unidade: 'm', dica: 'Largura total ocupada pelas calhas de coleta da água de lavagem.' },
    { nome: 'ncalhas', rotulo: 'Nº de calhas', dica: 'Calhas de coleta da água de lavagem em cada filtro (pelo menos 2).', inteiro: true },
    { nome: 'ar', rotulo: 'Taxa de ar', unidade: 'L/s·m²', dica: 'Vazão de ar por metro quadrado de filtro na lavagem com ar.' },
];

const MEIO: Def[] = [
    { nome: 'altura', rotulo: 'Espessura', unidade: 'm', dica: 'Espessura da camada.' },
    { nome: 'def', rotulo: 'Tamanho efetivo (def)', unidade: 'mm', dica: 'Diâmetro efetivo usado na relação espessura/diâmetro (L/d).' },
    { nome: 'cu', rotulo: 'Coef. de uniformidade', dica: 'CU = d60/d10.' },
    { nome: 'massa', rotulo: 'Massa específica', unidade: 'kg/m³', dica: 'Areia em torno de 2.650 kg/m³; antracito em torno de 1.400 kg/m³.' },
    { nome: 'porosidade', rotulo: 'Porosidade', dica: 'Fração de vazios do leito (por exemplo 0,42).' },
    { nome: 'esfericidade', rotulo: 'Coef. de esfericidade', dica: 'Entre 0 e 1 (por exemplo 0,8 para areia).' },
    { nome: 'd10', rotulo: 'd10', unidade: 'mm', dica: 'Diâmetro abaixo do qual passam 10 % dos grãos.' },
];

const SUPORTE: Def[] = [
    { nome: 'altura', rotulo: 'Espessura', unidade: 'm', dica: 'Espessura total da camada suporte (pedregulho).' },
    { nome: 'porosidade', rotulo: 'Porosidade', dica: 'Fração de vazios da camada suporte.' },
    { nome: 'esfericidade', rotulo: 'Coef. de esfericidade', dica: 'Entre 0 e 1.' },
    { nome: 'd10', rotulo: 'd10', unidade: 'mm', dica: 'Diâmetro abaixo do qual passam 10 % dos grãos.' },
    { nome: 'd90', rotulo: 'd90', unidade: 'mm', dica: 'Diâmetro abaixo do qual passam 90 % dos grãos; o diâmetro equivalente é √(d10·d90).' },
];

const chave = (grupo: string, nome: string) => `${grupo}.${nome}`;
const todas = [
    ...GERAIS.map((d) => chave('geral', d.nome)),
    ...MEIO.map((d) => chave('areia', d.nome)),
    ...MEIO.map((d) => chave('antracito', d.nome)),
    ...SUPORTE.map((d) => chave('suporte', d.nome)),
];
const VAZIO = Object.fromEntries(todas.map((k) => [k, ''])) as Record<string, string>;

const GRUPOS = ['Dados gerais', 'Meio filtrante', 'Camada suporte', 'Resultados'];
const CAMPOS_DO_GRUPO: Record<string, string[]> = {
    'Dados gerais': GERAIS.map((d) => chave('geral', d.nome)),
    'Meio filtrante': [...MEIO.map((d) => chave('areia', d.nome)), ...MEIO.map((d) => chave('antracito', d.nome))],
    'Camada suporte': SUPORTE.map((d) => chave('suporte', d.nome)),
};
const INTEIROS = GERAIS.filter((d) => d.inteiro).map((d) => chave('geral', d.nome));

export default function Filtracao() {
    const { dados, alterar, limpar, temDados } = useDados('filtracao', VAZIO);
    const [grupo, setGrupo] = useState(GRUPOS[0]);
    const [entrada, setEntrada] = useState<EntradaFiltr | null>(null);
    const [invalidos, setInvalidos] = useState<string[]>([]);
    const desenho = useRef<HTMLCanvasElement>(null);

    const ruinsDe = (campos: string[]) => campos.filter((k) => {
        const x = lerNumero(dados[k]);
        return !Number.isFinite(x) || x <= 0 || (INTEIROS.includes(k) && !Number.isInteger(x));
    });

    function avancar() {
        const ruins = ruinsDe(CAMPOS_DO_GRUPO[grupo]);
        setInvalidos(ruins);
        if (ruins.length) return;
        if (grupo !== 'Camada suporte') {
            setGrupo(GRUPOS[GRUPOS.indexOf(grupo) + 1]);
            return;
        }
        // antes de calcular confere todos os grupos e abre o primeiro com problema
        const primeiro = ['Dados gerais', 'Meio filtrante'].find((g) => ruinsDe(CAMPOS_DO_GRUPO[g]).length);
        if (primeiro) {
            setInvalidos(ruinsDe(CAMPOS_DO_GRUPO[primeiro]));
            setGrupo(primeiro);
            return;
        }
        const n = (k: string) => lerNumero(dados[k]);
        const meio = (g: string) => ({
            altura: n(chave(g, 'altura')), def: n(chave(g, 'def')), cu: n(chave(g, 'cu')), massa: n(chave(g, 'massa')),
            porosidade: n(chave(g, 'porosidade')), esfericidade: n(chave(g, 'esfericidade')), d10: n(chave(g, 'd10')),
        });
        setEntrada({
            q: n('geral.q'), taxa: n('geral.taxa'), nd: n('geral.nd'), ldec: n('geral.ldec'), lcalha: n('geral.lcalha'),
            ncalhas: n('geral.ncalhas'), ar: n('geral.ar'), areia: meio('areia'), antracito: meio('antracito'),
            suporte: { altura: n('suporte.altura'), porosidade: n('suporte.porosidade'), esfericidade: n('suporte.esfericidade'), d10: n('suporte.d10'), d90: n('suporte.d90') },
        });
        setGrupo('Resultados');
    }

    const campo = (g: string, d: Def) => {
        const k = chave(g, d.nome);
        return (
            <Campo key={k} rotulo={d.rotulo} nome={k} unidade={d.unidade} dica={d.dica} valor={dados[k]} invalido={invalidos.includes(k)}
                onChange={(v) => { alterar(k, v); setInvalidos(invalidos.filter((x) => x !== k)); }} />
        );
    };

    const ajuda = (
        <PainelAjuda>
            <ItemAjuda titulo="Critérios da NBR 12216">
                <p>Camada dupla sem filtro-piloto (item 5.12): taxa de até 360 m³/m²·dia.</p>
                <p>Areia: espessura de pelo menos 0,25 m, d10 de 0,40 a 0,45 mm e CU de 1,4 a 1,6. Antracito: pelo menos 0,45 m, d10 de 0,8 a 1,0 mm e CU de até 1,4.</p>
                <p>Lavagem: pelo menos 60 cm/min durante 10 min, com expansão de 20 a 30 %.</p>
            </ItemAjuda>
            <ItemAjuda titulo="O que o cálculo considera">
                <p>Número de filtros pela fórmula de Morrill e Wallace (pelo menos o dobro do número de decantadores); lavagem a 1,3 cm/s (78 cm/min) durante 10 min; perdas de carga pela equação de Kozeny-Carman; velocidade mínima de fluidificação pela equação de Wen e Yu.</p>
            </ItemAjuda>
        </PainelAjuda>
    );

    return (
        <Layout unidade="Filtração">
            <Calculadora
                titulo="Filtração"
                descricao="Dimensiona o filtro rápido de camada dupla (areia e antracito): área, lavagem, calhas, perdas de carga e fluidificação"
                grupos={GRUPOS}
                grupo={grupo}
                bloqueados={entrada ? [] : ['Resultados']}
                onGrupo={(g) => { setInvalidos([]); setGrupo(g); }}
                onLimpar={temDados ? () => { limpar(); setEntrada(null); setInvalidos([]); setGrupo(GRUPOS[0]); } : undefined}
            >
                {grupo !== 'Resultados' && <>
                    {invalidos.length > 0 &&
                        <MensagemErro role="alert">Preencha os campos destacados com números maiores que zero (números de decantadores e de calhas são inteiros).</MensagemErro>}
                    <Row>
                        <Column>
                            {grupo === 'Dados gerais' &&
                                <Secao>
                                    <FormTitle>Dados gerais</FormTitle>
                                    <Grid $colunas={3}>{GERAIS.map((d) => campo('geral', d))}</Grid>
                                </Secao>}
                            {grupo === 'Meio filtrante' && <>
                                <Secao>
                                    <FormTitle>Areia</FormTitle>
                                    <Grid $colunas={4}>{MEIO.map((d) => campo('areia', d))}</Grid>
                                </Secao>
                                <Secao>
                                    <FormTitle>Antracito</FormTitle>
                                    <Grid $colunas={4}>{MEIO.map((d) => campo('antracito', d))}</Grid>
                                </Secao>
                            </>}
                            {grupo === 'Camada suporte' &&
                                <Secao>
                                    <FormTitle>Camada suporte</FormTitle>
                                    <Grid $colunas={3}>{SUPORTE.map((d) => campo('suporte', d))}</Grid>
                                </Secao>}
                        </Column>
                        <VerticalSplitter />
                        <Column>{ajuda}</Column>
                    </Row>
                    <BarraAcoes>
                        {grupo === GRUPOS[0]
                            ? <span />
                            : <CancelButton type="button" onClick={() => { setInvalidos([]); setGrupo(GRUPOS[GRUPOS.indexOf(grupo) - 1]); }}>Voltar</CancelButton>}
                        <ActionButton type="button" onClick={avancar}>{grupo === 'Camada suporte' ? 'Dimensionar' : 'Próximo'}</ActionButton>
                    </BarraAcoes>
                </>}

                {grupo === 'Resultados' && entrada && <Resultados e={entrada} desenho={desenho} onVoltar={() => setGrupo('Camada suporte')} />}
            </Calculadora>
        </Layout>
    );
}

function Resultados({ e, desenho, onVoltar }: { e: EntradaFiltr; desenho: React.RefObject<HTMLCanvasElement>; onVoltar: () => void }) {
    const r = calcularFiltr(e);
    const itens: Verificacao[] = [
        ...criteriosFiltracao(e.taxa, e.areia, e.antracito),
        {
            ok: r.calhas.S >= r.calhas.sMin && r.calhas.S <= r.calhas.sMax,
            texto: `Espaçamento entre calhas S = ${numero(r.calhas.S, 2)} m`,
            detalhe: `Critério de projeto: entre 1,5 e 2,5 vezes a altura das calhas sobre o leito (${numero(r.calhas.sMin, 2)} a ${numero(r.calhas.sMax, 2)} m)`,
        },
        {
            ok: r.ld >= 1000,
            texto: `Relação espessura/diâmetro do meio (L/d) = ${numero(r.ld, 0)}`,
            detalhe: 'Critério de projeto: pelo menos 1.000',
        },
    ];
    const atende = itens.every((i) => i.ok);

    const linhas: Array<[string, string, number, number, string?]> = [
        ['Área total de filtração', 'm²', r.filtros.areaTotal, 1],
        ['Número de filtros', '', r.filtros.numero, 0],
        ['Área de cada filtro', 'm²', r.filtros.area, 2],
        ['Dimensão L do filtro', 'm', r.filtros.L, 2],
        ['Dimensão Y do filtro', 'm', r.filtros.Y, 2],
        ['Vazão de água de lavagem', 'm³/s', r.lavagem.vazao, 3],
        ['Volume de lavagem', 'm³', r.lavagem.volume, 1, '10 min de lavagem'],
        ['Volume de reservação', 'm³', r.lavagem.reservacao, 1, 'duas lavagens'],
        ['Tubulação de água de lavagem', 'mm', r.lavagem.tubulacao, 0],
        ['Vazão de ar', 'L/s', r.lavagem.ar, 1],
        ['Lâmina de água sobre o leito', 'm', r.lavagem.lamina, 2],
        ['Largura das calhas (B)', 'm', r.calhas.B, 3],
        ['Lâmina nas calhas (h)', 'm', r.calhas.h0, 3],
        ['Espaçamento entre calhas (S)', 'm', r.calhas.S, 2],
        ['Largura do vertedor de saída', 'm', r.vertedor.B, 2],
        ['Lâmina no vertedor de saída', 'm', r.vertedor.h, 3],
        ['Perda de carga na areia', 'm', r.perdas.areia, 3],
        ['Perda de carga no antracito', 'm', r.perdas.antracito, 3],
        ['Perda de carga no meio filtrante', 'm', r.perdas.total, 3],
        ['Perda de carga na camada suporte', 'm', r.perdas.suporte, 4],
        ['Vmf da areia', 'm/s', r.vmf.areia, 4, 'velocidade mínima de fluidificação'],
        ['Vmf do antracito', 'm/s', r.vmf.antracito, 4],
        ['Vmf do leito misto', 'm/s', r.vmf.misto, 4],
    ];

    function desenhar(ctx: CanvasRenderingContext2D) {
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`${numero(r.lavagem.tubulacao, 0)} mm`, 570, 59);
        ctx.fillText(`L = ${numero(r.filtros.L, 2)} m`, 210, 26);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`Y = ${numero(r.filtros.Y, 2)} m`, 30, 196);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`${numero(r.lavagem.lamina, 2)} m`, 490, 120);
        ctx.fillText(`${numero(r.calhas.h0, 2)} m`, 490, 185);
        ctx.fillText(`${numero(e.antracito.altura, 2)} m`, 490, 242);
        ctx.fillText(`${numero(e.areia.altura, 2)} m`, 490, 267);
        ctx.fillText(`${numero(e.suporte.altura, 2)} m`, 490, 288);
        ctx.fillText(`${numero(r.calhas.h0, 3)} m`, 300, 420);
        ctx.fillText(`${numero(r.calhas.B, 3)} m`, 235, 447);
        ctx.fillText(`espaço entre calhas = ${numero(r.calhas.S, 2)} m`, 380, 420);
    }

    return (
        <>
            <Conclusao $atende={atende} role="status">
                <strong>{atende ? 'O filtro atende aos critérios verificados' : 'O filtro não atende a todos os critérios'}</strong>
                {numero(r.filtros.numero, 0)} filtros de {numero(r.filtros.area, 1)} m² ({numero(r.filtros.L, 2)} m × {numero(r.filtros.Y, 2)} m) a {numero(e.taxa, 0)} m³/m²·dia.
            </Conclusao>

            <Destaques>
                <Destaque><span>Número de filtros</span><strong>{numero(r.filtros.numero, 0)}</strong></Destaque>
                <Destaque><span>Área de cada filtro</span><strong>{numero(r.filtros.area, 1)} <small>m²</small></strong></Destaque>
                <Destaque><span>Perda de carga no leito limpo</span><strong>{numero(r.perdas.total + r.perdas.suporte, 2)} <small>m</small></strong></Destaque>
                <Destaque><span>Água de lavagem</span><strong>{numero(r.lavagem.vazao, 2)} <small>m³/s</small></strong></Destaque>
            </Destaques>

            <Bloco>
                <TituloBloco>Baixar</TituloBloco>
                <Botoes>
                    <BotaoSecundario type="button" onClick={() => relatorioFiltracao(e, r, desenho.current)}>Relatório (PDF)</BotaoSecundario>
                    <BotaoSecundario type="button" onClick={() => baixarPng(desenho.current, 'Filtração.png')}>Desenho (PNG)</BotaoSecundario>
                </Botoes>
            </Bloco>

            <TituloBloco>Verificações</TituloBloco>
            <Verificacoes rotulo="Verificações do filtro" itens={itens} />

            <Desenho ref={desenho} imagem={imgDesenho} largura={650} altura={450} titulo="Planta e corte do filtro com as medidas calculadas" desenhar={desenhar} />

            <CaixaTabela $estreita>
                <Tabela>
                    <caption>Resultados</caption>
                    <thead><tr><th scope="col">Grandeza</th><th scope="col">Valor</th></tr></thead>
                    <tbody>
                        {linhas.map(([d, u, x, c, obs]) => (
                            <tr key={d}>
                                <th scope="row">{d}{u && <> <Unidade>({u})</Unidade></>}{obs && <Descricao>{obs}</Descricao>}</th>
                                <td>{numero(x, c)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Tabela>
            </CaixaTabela>

            <Paragrafo style={{ fontSize: 13 }}>Pré-dimensionamento para fins didáticos e de estudo; confira o projeto com a norma e um responsável técnico.</Paragrafo>
            <BarraAcoes>
                <CancelButton type="button" onClick={onVoltar}>Voltar aos dados</CancelButton>
                <span />
            </BarraAcoes>
        </>
    );
}
