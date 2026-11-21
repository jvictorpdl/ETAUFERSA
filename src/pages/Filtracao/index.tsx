import React, { useRef, useState } from 'react';
import { criteriosFiltracao } from '../../Utils/criterios';
import Layout from '../../components/ui/Layout';
import Calculadora from '../../components/ui/Calculadora';
import { Campo } from '../../components/ui/Campo';
import { ItemAjuda, PainelAjuda } from '../../components/ui/Ajuda';
import Desenho, { capturarDesenho } from '../../components/ui/Desenho';
import BaixarRelatorio from '../../components/ui/BaixarRelatorio';
import { linha, Relatorio } from '../../relatorio/modelo';
import Verificacoes, { Verificacao } from '../../components/ui/Verificacoes';
import useDados from '../../components/ui/useDados';
import useErros, { ListaErros } from '../../components/ui/useErros';
import { validarFiltracao } from '../../Utils/validacao';
import { lerNumero, numero } from '../../components/ui/formato';
import {
    ActionButton, BarraAcoes, CaixaTabela, CancelButton, Column, Conclusao,
    Descricao, Destaque, Destaques, FormTitle, Grid, Paragrafo, Row, Secao, Tabela, TituloBloco, Unidade, VerticalSplitter,
} from '../../components/ui/estilos';
import imgDesenho from '../../assets/images/exemploFilt.png';
import { calcularFiltr, criteriosProjetoFiltro, EntradaFiltr } from './calculo';

interface Def { nome: string; rotulo: string; unidade?: string; dica: string; inteiro?: boolean }

const GERAIS: Def[] = [
    { nome: 'q', rotulo: 'Q', unidade: 'm³/s', dica: 'Vazão total da ETA.' },
    { nome: 'taxa', rotulo: 'Taxa de filtração', unidade: 'm³/m²·dia', dica: 'Sem filtro-piloto, a NBR 12216 limita a 360 m³/m²·dia em camada dupla.' },
    { nome: 'nd', rotulo: 'Nº de decantadores', dica: 'O número de filtros é pelo menos o dobro do número de decantadores.', inteiro: true },
    { nome: 'ldec', rotulo: 'Largura do decantador', unidade: 'm', dica: 'Os filtros ficam lado a lado na largura do decantador; define a dimensão L do filtro.' },
    { nome: 'lcalha', rotulo: 'Largura da calha de lavagem', unidade: 'm', dica: 'Largura total ocupada pelas calhas de coleta da água de lavagem.' },
    { nome: 'ncalhas', rotulo: 'Nº de calhas', dica: 'Calhas de coleta da água de lavagem em cada filtro (pelo menos 2).', inteiro: true },
    { nome: 'ar', rotulo: 'Taxa de ar', unidade: 'L/s·m²', dica: 'Vazão de ar por metro quadrado de filtro na lavagem com ar; 0 se a lavagem é só com água.' },
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

// exemplo didático: filtro de camada dupla dentro dos limites da NBR 12216
const EXEMPLO: Record<string, string> = {
    'geral.q': '0,3', 'geral.taxa': '240', 'geral.nd': '2', 'geral.ldec': '10', 'geral.lcalha': '1', 'geral.ncalhas': '3', 'geral.ar': '15',
    'areia.altura': '0,3', 'areia.def': '0,55', 'areia.cu': '1,4', 'areia.massa': '2650', 'areia.porosidade': '0,42', 'areia.esfericidade': '0,8', 'areia.d10': '0,45',
    'antracito.altura': '0,5', 'antracito.def': '1', 'antracito.cu': '1,4', 'antracito.massa': '1400', 'antracito.porosidade': '0,5', 'antracito.esfericidade': '0,7', 'antracito.d10': '0,9',
    'suporte.altura': '0,4', 'suporte.porosidade': '0,4', 'suporte.esfericidade': '0,8', 'suporte.d10': '3', 'suporte.d90': '25',
};

export default function Filtracao() {
    const { dados, alterar, limpar, preencher, temDados } = useDados('filtracao', VAZIO);
    const [grupo, setGrupo] = useState(GRUPOS[0]);
    const [entrada, setEntrada] = useState<EntradaFiltr | null>(null);
    const { erros, definir, invalido, editado } = useErros();
    const desenho = useRef<HTMLCanvasElement>(null);

    function avancar() {
        const encontrados = validarFiltracao(dados, grupo);
        definir(encontrados);
        if (encontrados.length) return;
        if (grupo !== 'Camada suporte') {
            setGrupo(GRUPOS[GRUPOS.indexOf(grupo) + 1]);
            return;
        }
        // antes de calcular confere todos os grupos e abre o primeiro com problema
        const primeiro = ['Dados gerais', 'Meio filtrante'].find((g) => validarFiltracao(dados, g).length);
        if (primeiro) {
            definir(validarFiltracao(dados, primeiro));
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
            <Campo key={k} rotulo={d.rotulo} nome={k} unidade={d.unidade} dica={d.dica} valor={dados[k]} invalido={invalido(k)}
                onChange={(v) => { alterar(k, v); editado(k); }} />
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
                onGrupo={(g) => { definir([]); setGrupo(g); }}
                onLimpar={temDados ? () => { limpar(); setEntrada(null); definir([]); setGrupo(GRUPOS[0]); } : undefined}
                onExemplo={() => { preencher(EXEMPLO); definir([]); }}
            >
                {grupo !== 'Resultados' && <>
                    <ListaErros erros={erros} />
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
                            : <CancelButton type="button" onClick={() => { definir([]); setGrupo(GRUPOS[GRUPOS.indexOf(grupo) - 1]); }}>Voltar</CancelButton>}
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
        ...criteriosProjetoFiltro(r),
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

    const meio = (nome: string, m: EntradaFiltr['areia']) => ({
        titulo: nome,
        linhas: [
            linha('L', 'espessura', m.altura, 'm', 2),
            linha('def', 'tamanho efetivo', m.def, 'mm', 2),
            linha('CU', 'coeficiente de uniformidade', m.cu, '', 2),
            linha('ρs', 'massa específica', m.massa, 'kg/m³', 0),
            linha('ε', 'porosidade', m.porosidade, '', 2),
            linha('ψ', 'coeficiente de esfericidade', m.esfericidade, '', 2),
            linha('d10', 'diâmetro de 10 %', m.d10, 'mm', 2),
        ],
    });
    const montar = (): Relatorio => ({
        titulo: 'Filtração',
        descricao: 'Filtro rápido de camada dupla (areia e antracito): área, lavagem, calhas, perdas de carga e fluidificação',
        conclusao: {
            titulo: atende ? 'O filtro atende aos critérios verificados' : 'O filtro não atende a todos os critérios',
            atende,
            linhas: [`${numero(r.filtros.numero, 0)} filtros de ${numero(r.filtros.area, 1)} m² (${numero(r.filtros.L, 2)} m × ${numero(r.filtros.Y, 2)} m) a ${numero(e.taxa, 0)} m³/m²·dia.`],
        },
        fornecidos: [
            {
                titulo: 'Dados gerais',
                linhas: [
                    linha('Q', 'vazão total da ETA', e.q, 'm³/s', 4),
                    linha('Tf', 'taxa de filtração', e.taxa, 'm³/m²·dia', 1),
                    linha('Nd', 'número de decantadores', e.nd, '', 0),
                    linha('Ld', 'largura do decantador', e.ldec, 'm', 2),
                    linha('Lc', 'largura da calha de lavagem', e.lcalha, 'm', 2),
                    linha('Nc', 'número de calhas', e.ncalhas, '', 0),
                    linha('qar', 'taxa de ar', e.ar, 'L/s·m²', 2),
                ],
            },
            meio('Areia', e.areia),
            meio('Antracito', e.antracito),
            {
                titulo: 'Camada suporte',
                linhas: [
                    linha('L', 'espessura', e.suporte.altura, 'm', 2),
                    linha('ε', 'porosidade', e.suporte.porosidade, '', 2),
                    linha('ψ', 'coeficiente de esfericidade', e.suporte.esfericidade, '', 2),
                    linha('d10', 'diâmetro de 10 %', e.suporte.d10, 'mm', 2),
                    linha('d90', 'diâmetro de 90 %', e.suporte.d90, 'mm', 2),
                ],
            },
        ],
        calculados: [{ titulo: 'Filtro', linhas: linhas.map(([d, u, x, c, obs]) => linha(d, obs ?? '', x, u, c)) }],
        verificacoes: itens,
        tabelas: [],
        desenho: capturarDesenho(desenho.current, 650, 450),
    });

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

            <BaixarRelatorio montar={montar} />

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
