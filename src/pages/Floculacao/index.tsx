import React, { useRef, useState } from 'react';
import { criteriosFloculacao } from '../../Utils/criterios';
import Layout from '../../components/ui/Layout';
import Calculadora from '../../components/ui/Calculadora';
import { Campo, CampoSelecao } from '../../components/ui/Campo';
import { ItemAjuda, PainelAjuda } from '../../components/ui/Ajuda';
import Desenho, { capturarDesenho } from '../../components/ui/Desenho';
import BaixarRelatorio from '../../components/ui/BaixarRelatorio';
import { linha, Relatorio } from '../../relatorio/modelo';
import Verificacoes from '../../components/ui/Verificacoes';
import useDados from '../../components/ui/useDados';
import useErros, { ListaErros } from '../../components/ui/useErros';
import { REGRAS_FLOCULACAO_DADOS, regrasGradientes, validarCampos } from '../../Utils/validacao';
import { lerNumero, numero } from '../../components/ui/formato';
import {
    ActionButton, Aviso, BarraAcoes, CaixaTabela, CancelButton, Column, Conclusao,
    Destaque, Destaques, FormTitle, Grid, Paragrafo, Row, Secao, Tabela, TituloBloco, VerticalSplitter,
} from '../../components/ui/estilos';
import img3 from '../../assets/images/exemploFloc3.png';
import img4 from '../../assets/images/exemploFloc.png';
import img5 from '../../assets/images/exemploFloc5.png';
import { calcularFloc, EntradaFloc, ResultadoFloc } from './calculo';

const GRUPOS = ['Dados do floculador', 'Gradientes', 'Resultados'];

const CAMPOS = [
    { nome: 'q', rotulo: 'Q', unidade: 'm³/s', dica: 'Vazão total da ETA.', inteiro: false },
    { nome: 't', rotulo: 't', unidade: 'min', dica: 'Tempo total de floculação. A NBR 12216 recomenda de 20 a 30 min em floculadores hidráulicos.', inteiro: false },
    { nome: 'prof', rotulo: 'H', unidade: 'm', dica: 'Profundidade da água no floculador.', inteiro: false },
    { nome: 'nd', rotulo: 'Nº de unidades', unidade: '', dica: 'Número de floculadores em paralelo (em geral, um por decantador). A vazão é dividida entre eles.', inteiro: true },
    { nome: 'l', rotulo: 'Largura', unidade: 'm', dica: 'Largura do floculador; com a área, define o comprimento B.', inteiro: false },
] as const;

type Dados = { q: string; t: string; nc: string; prof: string; nd: string; l: string; g1: string; g2: string; g3: string; g4: string; g5: string };
const VAZIO: Dados = { q: '', t: '', nc: '3', prof: '', nd: '', l: '', g1: '', g2: '', g3: '', g4: '', g5: '' };
// exemplo didático: G decrescente em 4 câmaras, com a primeira abaixo de 70 s⁻¹
const EXEMPLO: Partial<Dados> = { q: '0,3', t: '25', nc: '4', prof: '4', nd: '2', l: '5', g1: '60', g2: '45', g3: '30', g4: '20' };
const COLUNAS = ['n', 'e (m)', 'V₁ (m/s)', 'V₂ (m/s)', 'Δhd (m)', 'Δhl (m)', 'Δht (m)', 'G (s⁻¹)'];
const CASAS = [0, 3, 3, 3, 4, 4, 4, 1];

export default function Floculacao() {
    const { dados, alterar, limpar, preencher, temDados } = useDados<Dados>('floculacao', VAZIO);
    const [grupo, setGrupo] = useState(GRUPOS[0]);
    const [entrada, setEntrada] = useState<EntradaFloc | null>(null);
    const { erros, definir, invalido, editado } = useErros();
    const desenho = useRef<HTMLCanvasElement>(null);
    const nc = Number(dados.nc);
    const gNomes = ['g1', 'g2', 'g3', 'g4', 'g5'].slice(0, nc) as Array<keyof Dados>;

    function validarDados() {
        const encontrados = validarCampos(dados, REGRAS_FLOCULACAO_DADOS);
        definir(encontrados);
        return encontrados.length === 0;
    }

    function dimensionar() {
        if (!validarDados()) { setGrupo(GRUPOS[0]); return; }
        const encontrados = validarCampos(dados, regrasGradientes(nc));
        definir(encontrados);
        if (encontrados.length) return;
        setEntrada({
            q: lerNumero(dados.q), t: lerNumero(dados.t), nc, prof: lerNumero(dados.prof), nd: lerNumero(dados.nd), l: lerNumero(dados.l),
            G: gNomes.map((g) => lerNumero(dados[g])),
        });
        setGrupo('Resultados');
    }

    const mudar = (campo: keyof Dados, v: string) => { alterar(campo, v); editado(campo); };

    return (
        <Layout unidade="Floculação">
            <Calculadora
                titulo="Floculação"
                descricao="Dimensiona o floculador hidráulico de chicanas com fluxo vertical, com 3, 4 ou 5 câmaras de gradiente decrescente"
                grupos={GRUPOS}
                grupo={grupo}
                bloqueados={entrada ? [] : ['Resultados']}
                onGrupo={setGrupo}
                onLimpar={temDados ? () => { limpar(); setEntrada(null); definir([]); setGrupo(GRUPOS[0]); } : undefined}
                onExemplo={() => { preencher(EXEMPLO); definir([]); }}
            >
                {grupo !== 'Resultados' && <ListaErros erros={erros} />}

                {grupo === GRUPOS[0] && <>
                    <Row>
                        <Column>
                            <Secao>
                                <FormTitle>Dados do floculador</FormTitle>
                                <Grid $colunas={3}>
                                    {CAMPOS.map((c) => (
                                        <Campo key={c.nome} rotulo={c.rotulo} nome={c.nome} unidade={c.unidade || undefined} dica={c.dica}
                                            valor={dados[c.nome]} invalido={invalido(c.nome)} onChange={(v) => mudar(c.nome, v)} />
                                    ))}
                                    <CampoSelecao rotulo="Nº de câmaras" nome="nc" valor={dados.nc}
                                        dica="Câmaras em série, cada uma com seu gradiente de velocidade."
                                        opcoes={[3, 4, 5].map((n) => ({ valor: String(n), texto: `${n} câmaras` }))}
                                        onChange={(v) => alterar('nc', v)} />
                                </Grid>
                            </Secao>
                        </Column>
                        <VerticalSplitter />
                        <Column>
                            <PainelAjuda>
                                <ItemAjuda titulo="Critérios da NBR 12216">
                                    <p>Floculador hidráulico (item 5.9): tempo de 20 a 30 min; G de até 70 s⁻¹ na primeira câmara e de pelo menos 10 s⁻¹ na última.</p>
                                    <p>Chicanas (5.9.6): velocidade de 10 a 30 cm/s e espaçamento mínimo de 0,60 m, que pode ser menor com chicanas removíveis.</p>
                                </ItemAjuda>
                                <ItemAjuda titulo="Como as câmaras são divididas">
                                    <p>Os tempos das câmaras são escolhidos para que G·t seja igual em todas, somando o tempo total. O número de chicanas sai da fórmula de Richter.</p>
                                </ItemAjuda>
                            </PainelAjuda>
                        </Column>
                    </Row>
                    <BarraAcoes>
                        <span />
                        <ActionButton type="button" onClick={() => { if (validarDados()) setGrupo('Gradientes'); }}>Próximo</ActionButton>
                    </BarraAcoes>
                </>}

                {grupo === 'Gradientes' && <>
                    <Row>
                        <Column>
                            <Secao>
                                <FormTitle>Gradiente de velocidade de cada câmara</FormTitle>
                                <Grid $colunas={nc}>
                                    {gNomes.map((g, i) => (
                                        <Campo key={g} rotulo={`G${i + 1}`} nome={g} unidade="s⁻¹" valor={dados[g]} invalido={invalido(g)}
                                            dica={`Gradiente de velocidade desejado na câmara ${i + 1}.`} onChange={(v) => mudar(g, v)} />
                                    ))}
                                </Grid>
                            </Secao>
                        </Column>
                        <VerticalSplitter />
                        <Column>
                            <PainelAjuda>
                                <ItemAjuda titulo="Valores usuais de G">
                                    <p>Os gradientes decrescem da primeira para a última câmara, por exemplo 70, 50, 35 e 20 s⁻¹. Sem ensaios, a NBR 12216 limita a 70 s⁻¹ na primeira e pede pelo menos 10 s⁻¹ na última.</p>
                                </ItemAjuda>
                                <ItemAjuda titulo="Se alguma câmara passar de 70 s⁻¹">
                                    <p>Nos resultados, a câmara fica em vermelho e você pode aplicar um fator de correção: o G alvo passa a ser 70 × (1 − fator/100) e o número de chicanas é recalculado.</p>
                                </ItemAjuda>
                            </PainelAjuda>
                        </Column>
                    </Row>
                    <BarraAcoes>
                        <CancelButton type="button" onClick={() => setGrupo(GRUPOS[0])}>Voltar</CancelButton>
                        <ActionButton type="button" onClick={dimensionar}>Dimensionar</ActionButton>
                    </BarraAcoes>
                </>}

                {grupo === 'Resultados' && entrada &&
                    <Resultados key={JSON.stringify(entrada)} e={entrada} desenho={desenho} onVoltar={() => setGrupo('Gradientes')} />}
            </Calculadora>
        </Layout>
    );
}

function TabelaCamaras({ M, titulo, nc }: { M: number[][]; titulo: string; nc: number }) {
    return (
        <CaixaTabela>
            <Tabela>
                <caption>{titulo}</caption>
                <thead>
                    <tr><th scope="col">Câmara</th>{COLUNAS.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
                </thead>
                <tbody>
                    {Array.from({ length: nc }, (_, i) => (
                        <tr key={i}>
                            <th scope="row">{i + 1}</th>
                            {M.map((col, k) => (
                                <td key={k} className={k === 7 && col[i] > 70 ? 'fora' : undefined}>
                                    {numero(col[i], CASAS[k])}{k === 7 && col[i] > 70 ? ' *' : ''}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Tabela>
        </CaixaTabela>
    );
}

function Resultados({ e, desenho, onVoltar }: { e: EntradaFloc; desenho: React.RefObject<HTMLCanvasElement>; onVoltar: () => void }) {
    const [fatorTexto, setFatorTexto] = useState('');
    const [fator, setFator] = useState<number | null>(null);
    const [erroFator, setErroFator] = useState(false);

    const base: ResultadoFloc = calcularFloc(e, 0);
    const corrigido = fator !== null ? calcularFloc(e, fator).corrigida : undefined;
    const final = corrigido ?? base.original;
    const acima = base.original[7].map((g, i) => (g > 70 ? i + 1 : 0)).filter(Boolean);
    const aindaAcima = final[7].some((g) => g > 70);
    const verificacoes = criteriosFloculacao(e.t, final[7], final[2], final[1]);
    const atende = !aindaAcima && verificacoes.every((i) => i.ok);
    const imagem = e.nc === 3 ? img3 : e.nc === 4 ? img4 : img5;

    function aplicar() {
        const f = lerNumero(fatorTexto);
        if (!(f > 0 && f < 100)) { setErroFator(true); return; }
        setErroFator(false);
        setFator(f);
    }

    const tabelaCamaras = (M: number[][], titulo: string) => ({
        titulo,
        colunas: ['Câmara', ...COLUNAS],
        linhas: Array.from({ length: e.nc }, (_, i) => [i + 1, ...M.map((col) => col[i])]),
        casas: [0, ...CASAS],
    });

    const montar = (): Relatorio => ({
        titulo: 'Floculação',
        descricao: 'Floculador hidráulico de chicanas com fluxo vertical, com câmaras de gradiente decrescente',
        conclusao: {
            titulo: aindaAcima ? 'G acima de 70 s⁻¹ em alguma câmara' : atende ? 'O floculador atende aos critérios da NBR 12216' : 'O floculador não atende a todos os critérios da NBR 12216',
            atende,
            linhas: [`${e.nc} câmaras, ${numero(base.vol, 0)} m³ por unidade, G de ${numero(final[7][0], 1)} a ${numero(final[7][e.nc - 1], 1)} s⁻¹.`,
                ...(fator !== null ? [`Fator de correção aplicado: ${numero(fator, 1)} %.`] : [])],
        },
        fornecidos: [
            {
                titulo: 'Dados do floculador',
                linhas: [
                    linha('Q', 'vazão total da ETA', e.q, 'm³/s', 4),
                    linha('t', 'tempo de floculação', e.t, 'min', 1),
                    linha('Nc', 'número de câmaras', e.nc, '', 0),
                    linha('H', 'profundidade', e.prof, 'm', 2),
                    linha('Nd', 'número de unidades', e.nd, '', 0),
                    linha('L', 'largura', e.l, 'm', 2),
                    ...(fator !== null ? [linha('FC', 'fator de correção do G', fator, '%', 1)] : []),
                ],
            },
            { titulo: 'Gradiente desejado em cada câmara', linhas: e.G.map((g, i) => linha(`G${i + 1}`, `câmara ${i + 1}`, g, 's⁻¹', 1)) },
        ],
        calculados: [{
            titulo: 'Floculador (por unidade)',
            linhas: [
                linha('q', 'vazão por unidade', base.q, 'm³/s', 4),
                linha('V', 'volume', base.vol, 'm³', 1),
                linha('A', 'área superficial', base.area, 'm²', 2),
                linha('B', 'área / largura', base.B, 'm', 3),
                linha('a', 'B / número de câmaras', base.a, 'm', 3),
            ],
        }],
        verificacoes,
        tabelas: [
            tabelaCamaras(base.original, corrigido ? 'Câmaras sem correção' : 'Câmaras'),
            ...(corrigido ? [tabelaCamaras(corrigido, `Câmaras com fator de ${numero(fator ?? 0, 1)} %`)] : []),
        ],
        desenho: capturarDesenho(desenho.current, 650, 450),
    });

    function desenhar(ctx: CanvasRenderingContext2D) {
        const esp = final[1];
        const a = numero(base.a, 3);
        const v1 = final[2][0];
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`L = ${numero(base.B, 3)} m`, 297, 15);
        ctx.font = '9px Inter, sans-serif';
        const ys = [50, 90, 130, 170, 210];
        for (let i = 0; i < e.nc; i++) ctx.fillText(`a = ${a} m`, i === 0 ? 7 : 20, ys[i]);
        const pe: Array<[number, number]> = [[105, 40], [120, 80], [120, 120], [135, 160], [135, 203]];
        for (let i = 0; i < e.nc; i++) ctx.fillText(`e = ${numero(esp[i], 3)} m`, pe[i][0], pe[i][1]);
        ctx.fillText(`H =     ${numero(e.prof, 2)} m`, 525, 320);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('1,5 e =', 490, 375);
        ctx.fillText('1,00 m', 490, 390);
        ctx.fillText(`V1 = ${numero(v1, 3)} m/s`, 20, 320);
        ctx.fillText('V1', 107, 340);
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText(`V2 = ${numero((2 / 3) * v1, 3)} m/s`, 105, 280);
        ctx.fillText('0,10', 140, 385);
    }

    return (
        <>
            <Conclusao $atende={atende} role="status">
                <strong>
                    {aindaAcima
                        ? `G acima de 70 s⁻¹ na(s) câmara(s) ${final[7].map((g, i) => (g > 70 ? i + 1 : 0)).filter(Boolean).join(', ')}`
                        : atende ? 'O floculador atende aos critérios da NBR 12216' : 'O floculador não atende a todos os critérios da NBR 12216'}
                </strong>
                {e.nc} câmaras, {numero(base.vol, 0)} m³ por unidade, G de {numero(final[7][0], 1)} a {numero(final[7][e.nc - 1], 1)} s⁻¹.
            </Conclusao>

            {acima.length > 0 &&
                <Aviso>
                    <strong>Correção do gradiente</strong>
                    <div style={{ margin: '4px 0 8px' }}>
                        A(s) câmara(s) {acima.join(', ')} passaram de 70 s⁻¹. Com o fator, o G alvo vira 70 × (1 − fator/100) e as chicanas são recalculadas.
                        {fator !== null && aindaAcima && ' Com este fator o G ainda passa de 70 s⁻¹ porque o número de chicanas é arredondado para cima; tente um fator maior.'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', maxWidth: 420 }}>
                        <div style={{ flex: '1 1 160px' }}>
                            <Campo rotulo="Fator de correção" nome="fator" unidade="%" valor={fatorTexto} invalido={erroFator}
                                onChange={(v) => { setFatorTexto(v); setErroFator(false); }} />
                        </div>
                        <ActionButton type="button" onClick={aplicar}>Aplicar correção</ActionButton>
                    </div>
                    {erroFator && <div style={{ marginTop: 6 }}>Informe um fator entre 0 e 100 %.</div>}
                </Aviso>}

            <Destaques>
                <Destaque><span>Volume por unidade</span><strong>{numero(base.vol, 0)} <small>m³</small></strong></Destaque>
                <Destaque><span>Área por unidade</span><strong>{numero(base.area, 1)} <small>m²</small></strong></Destaque>
                <Destaque><span>B (área / largura)</span><strong>{numero(base.B, 2)} <small>m</small></strong></Destaque>
                <Destaque><span>a (B / nº de câmaras)</span><strong>{numero(base.a, 2)} <small>m</small></strong></Destaque>
            </Destaques>

            <BaixarRelatorio montar={montar} />

            <TituloBloco>Verificações da NBR 12216</TituloBloco>
            <Verificacoes rotulo="Verificações da NBR 12216" itens={verificacoes} />

            <TabelaCamaras M={base.original} nc={e.nc} titulo={corrigido ? 'Câmaras, sem correção' : 'Câmaras (* G acima de 70 s⁻¹)'} />
            {corrigido && <TabelaCamaras M={corrigido} nc={e.nc} titulo={`Câmaras, com fator de correção de ${numero(fator ?? 0, 1)} %`} />}

            <Desenho ref={desenho} imagem={imagem} largura={650} altura={450} titulo="Planta e corte do floculador com as medidas calculadas" desenhar={desenhar} />

            <Paragrafo style={{ fontSize: 13 }}>Pré-dimensionamento para fins didáticos e de estudo; confira o projeto com a norma e um responsável técnico.</Paragrafo>
            <BarraAcoes>
                <CancelButton type="button" onClick={onVoltar}>Voltar aos dados</CancelButton>
                <span />
            </BarraAcoes>
        </>
    );
}
