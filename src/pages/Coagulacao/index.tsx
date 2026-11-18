import React, { useRef, useState } from 'react';
import Coag from '../../Utils/Coag';
import { criteriosCoagulacao } from '../../Utils/criterios';
import Layout from '../../components/ui/Layout';
import Calculadora from '../../components/ui/Calculadora';
import { Campo, CampoSelecao } from '../../components/ui/Campo';
import { ItemAjuda, PainelAjuda } from '../../components/ui/Ajuda';
import Desenho, { capturarDesenho } from '../../components/ui/Desenho';
import BaixarRelatorio from '../../components/ui/BaixarRelatorio';
import { linha, Relatorio } from '../../relatorio/modelo';
import Verificacoes from '../../components/ui/Verificacoes';
import useDados from '../../components/ui/useDados';
import { lerNumero, numero } from '../../components/ui/formato';
import {
    ActionButton, Aviso, BarraAcoes, CaixaTabela, CancelButton, Column, Conclusao,
    Descricao, Destaque, Destaques, FormTitle, Grid, MensagemErro, Paragrafo, Row, Secao, Tabela, TituloBloco, Unidade, VerticalSplitter,
} from '../../components/ui/estilos';
import imgModelo from '../../assets/images/exemploCalha.png';
import imgDesenho from '../../assets/images/exemploCoag.png';

// Calhas Parshall na ordem da tabela de Coag.valoresParshal, com a faixa de vazão (m³/s)
const CALHAS = [
    { w: '7,6', pol: '3"', min: 0.0008, max: 0.0538 },
    { w: '15,2', pol: '6"', min: 0.0014, max: 0.1104 },
    { w: '22,9', pol: '9"', min: 0.0025, max: 0.252 },
    { w: '30,5', pol: '1\'', min: 0.0031, max: 0.4559 },
    { w: '45,7', pol: '1½\'', min: 0.0042, max: 0.6966 },
    { w: '61,0', pol: '2\'', min: 0.0119, max: 0.937 },
    { w: '91,5', pol: '3\'', min: 0.0173, max: 1.4272 },
    { w: '122,0', pol: '4\'', min: 0.0368, max: 1.9227 },
    { w: '152,5', pol: '5\'', min: 0.0453, max: 2.4239 },
    { w: '183,0', pol: '6\'', min: 0.0736, max: 2.9308 },
    { w: '213,5', pol: '7\'', min: 0.085, max: 3.4377 },
    { w: '244,0', pol: '8\'', min: 0.0991, max: 3.9502 },
];
const litros = (m3: number) => numero(m3 * 1000, 1);

const COLUNAS_CALHA = [
    { s: 'W', u: 'm', d: 'largura da garganta' },
    { s: 'k', u: '', d: 'coeficiente de h0 = k·Qⁿ' },
    { s: 'n', u: '', d: 'expoente de h0 = k·Qⁿ' },
    { s: 'N', u: 'm', d: 'rebaixo da garganta' },
    { s: 'D', u: 'm', d: 'largura na entrada' },
    { s: 'K', u: 'm', d: 'desnível da saída' },
    { s: "G'", u: 'm', d: 'comprimento da saída' },
    { s: 'C', u: 'm', d: 'largura na saída' },
];

const GRUPOS = ['Dados da calha', 'Resultados'];

export default function Coagulacao() {
    const { dados, alterar, limpar, temDados } = useDados('coagulacao', { calha: '', q: '' });
    const [grupo, setGrupo] = useState(GRUPOS[0]);
    const [calculo, setCalculo] = useState<{ q: number; opcao: number } | null>(null);
    const [erros, setErros] = useState<string[]>([]);
    const [invalidos, setInvalidos] = useState<string[]>([]);
    const desenho = useRef<HTMLCanvasElement>(null);

    const opcao = dados.calha === '' ? -1 : Number(dados.calha);
    const calha = CALHAS[opcao];

    function dimensionar() {
        const q = lerNumero(dados.q);
        const msgs: string[] = [];
        const campos: string[] = [];
        if (!calha) {
            msgs.push('Escolha a calha Parshall.');
            campos.push('calha');
        }
        if (!Number.isFinite(q) || q <= 0) {
            msgs.push('Informe a vazão Q, em m³/s, maior que zero.');
            campos.push('q');
        } else if (calha && (q < calha.min || q > calha.max)) {
            msgs.push(`A calha W ${calha.w} cm mede vazões de ${litros(calha.min)} a ${litros(calha.max)} L/s (${numero(calha.min, 4)} a ${numero(calha.max, 4)} m³/s). Ajuste Q ou escolha outra calha.`);
            campos.push('q');
        }
        setErros(msgs);
        setInvalidos(campos);
        if (msgs.length) return;
        setCalculo({ q, opcao });
        setGrupo('Resultados');
    }

    return (
        <Layout unidade="Coagulação">
            <Calculadora
                titulo="Coagulação"
                descricao="Dimensiona a calha Parshall usada como misturador rápido: ressalto hidráulico, tempo de mistura e gradiente de velocidade"
                grupos={GRUPOS}
                grupo={grupo}
                bloqueados={calculo ? [] : ['Resultados']}
                onGrupo={setGrupo}
                onLimpar={temDados ? () => { limpar(); setCalculo(null); setErros([]); setInvalidos([]); setGrupo(GRUPOS[0]); } : undefined}
            >
                {grupo === 'Dados da calha' && <>
                    {erros.length > 0 && <MensagemErro role="alert">{erros.map((e) => <div key={e}>{e}</div>)}</MensagemErro>}
                    <Row>
                        <Column>
                            <Secao>
                                <FormTitle>Dados da calha</FormTitle>
                                <Grid $colunas={2}>
                                    <CampoSelecao
                                        rotulo="Calha Parshall"
                                        nome="calha"
                                        valor={dados.calha}
                                        vazio="Escolha pela faixa de vazão"
                                        invalido={invalidos.includes('calha')}
                                        dica="W é a largura da garganta. Escolha a calha cuja faixa de vazão inclui a vazão de projeto."
                                        opcoes={CALHAS.map((c, i) => ({ valor: String(i), texto: `W ${c.w} cm (${c.pol}) · ${litros(c.min)} a ${litros(c.max)} L/s` }))}
                                        onChange={(v) => { alterar('calha', v); setInvalidos([]); }}
                                    />
                                    <Campo
                                        rotulo="Q"
                                        nome="q"
                                        unidade="m³/s"
                                        valor={dados.q}
                                        invalido={invalidos.includes('q')}
                                        dica="Vazão que passa pela calha (vazão da ETA)."
                                        onChange={(v) => { alterar('q', v); setInvalidos([]); }}
                                    />
                                </Grid>
                            </Secao>
                            {calha &&
                                <Secao>
                                    <FormTitle>Dimensões da calha W {calha.w} cm</FormTitle>
                                    <CaixaTabela>
                                        <Tabela>
                                            <thead>
                                                <tr>{COLUNAS_CALHA.map((c) => <th key={c.s} scope="col" title={c.d}>{c.s}{c.u && ` (${c.u})`}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                <tr>{Coag.valoresParshal(opcao).map((x, i) => <td key={i}>{numero(x, 3)}</td>)}</tr>
                                            </tbody>
                                        </Tabela>
                                    </CaixaTabela>
                                </Secao>}
                        </Column>
                        <VerticalSplitter />
                        <Column>
                            <PainelAjuda>
                                <ItemAjuda titulo="Como escolher a calha">
                                    <p>Cada calha mede uma faixa de vazão. Escolha a menor calha cuja faixa inclui a vazão de projeto: a lâmina fica maior e o ressalto, mais estável.</p>
                                </ItemAjuda>
                                <ItemAjuda titulo="Critérios da NBR 12216">
                                    <p>Mistura rápida com coagulante metálico: G entre 700 e 1.100 s⁻¹ e tempo de mistura de até 5 s (item 5.8).</p>
                                    <p>Ressalto com Froude entre 2,5 e 4,5 é oscilante e pede um dispositivo que anule as oscilações a jusante (5.8.4).</p>
                                </ItemAjuda>
                                <ItemAjuda titulo="Coeficientes k e n">
                                    <p>h0 = k·Qⁿ vem da equação de descarga livre de Parshall (ASTM D1941, NBR ISO 9826). Para as calhas de 3" e 9", livros brasileiros trazem valores que não batem com essa equação.</p>
                                </ItemAjuda>
                                <ItemAjuda titulo="Ver o modelo da calha">
                                    <img src={imgModelo} alt="Planta e corte de uma calha Parshall com as dimensões W, D, C, N, K e G'" style={{ width: '100%', height: 'auto' }} />
                                </ItemAjuda>
                            </PainelAjuda>
                        </Column>
                    </Row>
                    <BarraAcoes>
                        <span />
                        <ActionButton type="button" onClick={dimensionar}>Dimensionar</ActionButton>
                    </BarraAcoes>
                </>}

                {grupo === 'Resultados' && calculo && <Resultados q={calculo.q} opcao={calculo.opcao} desenho={desenho} onVoltar={() => setGrupo(GRUPOS[0])} />}
            </Calculadora>
        </Layout>
    );
}

function Resultados({ q, opcao, desenho, onVoltar }: { q: number; opcao: number; desenho: React.RefObject<HTMLCanvasElement>; onVoltar: () => void }) {
    const v = Coag.valoresParshal(opcao);
    const [V, H, O] = Coag.coag(q, v);
    const calha = CALHAS[opcao];
    const semSolucao = !Number.isFinite(V[1]);
    const foraDaCalha = !semSolucao && H[3] <= 0;
    const verificacoes = semSolucao || foraDaCalha ? [] : criteriosCoagulacao(O[6], O[5], O[3]);
    const atende = !semSolucao && !foraDaCalha && verificacoes.every((i) => i.ok);

    const linhas: Array<[string, string, string, number, number]> = [
        ['Vs', 'velocidade na seção de medição', 'm/s', V[0], 3],
        ['V1', 'velocidade antes do ressalto', 'm/s', V[1], 3],
        ['V2', 'velocidade no ressalto', 'm/s', V[2], 3],
        ['V3', 'velocidade na saída da calha', 'm/s', V[3], 3],
        ['h0', 'lâmina na seção de medição', 'm', H[0], 3],
        ['h1', 'lâmina antes do ressalto', 'm', H[1], 3],
        ['h2', 'lâmina do ressalto', 'm', H[2], 3],
        ['h3', 'lâmina na saída da calha', 'm', H[3], 3],
        ["D'", 'largura na seção de medição', 'm', O[0], 3],
        ['q', 'vazão por metro de garganta', 'm³/s·m', O[1], 4],
        ['E0', 'energia disponível', 'm', O[2], 3],
        ['Fr1', 'número de Froude antes do ressalto', '', O[3], 2],
        ['hf', 'perda de carga no ressalto', 'm', O[4], 3],
        ['T', 'tempo de mistura', 's', O[5], 2],
        ['G', 'gradiente de velocidade', 's⁻¹', O[6], 0],
    ];

    const titulo = semSolucao ? 'O método do ressalto não tem solução com esta vazão'
        : foraDaCalha ? 'O ressalto não se forma dentro da calha'
            : atende ? 'A calha atende à NBR 12216 como misturador rápido' : 'A calha não atende a todos os critérios da NBR 12216';

    // relatório com tudo o que foi digitado e calculado, para PDF, Word, Excel e CSV
    const montar = (): Relatorio => ({
        titulo: 'Coagulação',
        descricao: 'Calha Parshall como misturador rápido: ressalto hidráulico, tempo de mistura e gradiente de velocidade',
        conclusao: {
            titulo,
            atende,
            linhas: [`Calha W ${calha.w} cm (${calha.pol}) com Q = ${numero(q, 4)} m³/s: G = ${numero(O[6], 0)} s⁻¹ em ${numero(O[5], 2)} s.`],
        },
        fornecidos: [
            { titulo: 'Dados da calha', linhas: [linha('W', `largura da garganta da calha ${calha.pol}`, v[0], 'm', 3), linha('Q', 'vazão', q, 'm³/s', 4)] },
            { titulo: 'Dimensões da calha (tabela)', linhas: COLUNAS_CALHA.map((c, i) => linha(c.s, c.d, v[i], c.u, 3)) },
        ],
        calculados: [{ titulo: 'Ressalto hidráulico', linhas: linhas.map(([s, d, u, x, c]) => linha(s, d, x, u, c)) }],
        verificacoes: verificacoes,
        tabelas: [],
        desenho: capturarDesenho(desenho.current, 550, 350),
    });

    function desenhar(ctx: CanvasRenderingContext2D) {
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(numero(v[0], 2), 320, 75);
        ctx.fillText(numero(v[4], 2), 80, 120);
        ctx.fillText(numero(V[2], 2), 140, 120);
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(numero(v[6], 2), 260, 120);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(numero(v[7], 2), 410, 120);
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(numero(V[0], 1), 195, 157);
        ctx.fillText(numero(v[1], 2), 265, 150);
        ctx.fillText(numero((3 * Number(V[0].toFixed(1))) / 2, 2), 195, 177);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(numero(H[0], 2), 130, 320);
        ctx.fillText(numero(H[1], 2), 260, 325);
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(numero(H[2], 2), 320, 315);
        ctx.fillText(numero(H[3] + O[4], 2), 420, 315);
    }

    return (
        <>
            {semSolucao &&
                <Conclusao $atende={false} role="status">
                    <strong>O método do ressalto não tem solução com esta vazão</strong>
                    A energia disponível na calha (E0 = {numero(O[2], 3)} m) é menor que a energia crítica na garganta. Escolha uma calha maior.
                </Conclusao>}
            {foraDaCalha &&
                <Conclusao $atende={false} role="status">
                    <strong>O ressalto não se forma dentro da calha</strong>
                    A lâmina na saída (h3 = {numero(H[3], 3)} m) fica abaixo do degrau (N − K); h3, V3, T e G não valem. Aumente a vazão ou escolha uma calha menor.
                </Conclusao>}
            {!semSolucao && !foraDaCalha &&
                <Conclusao $atende={atende} role="status">
                    <strong>{atende ? 'A calha atende à NBR 12216 como misturador rápido' : 'A calha não atende a todos os critérios da NBR 12216'}</strong>
                    Calha W {calha.w} cm ({calha.pol}) com Q = {numero(q, 4)} m³/s: G = {numero(O[6], 0)} s⁻¹ em {numero(O[5], 2)} s.
                </Conclusao>}

            {!semSolucao && <>
                <Destaques>
                    <Destaque><span>Gradiente de velocidade</span><strong>{numero(O[6], 0)} <small>s⁻¹</small></strong></Destaque>
                    <Destaque><span>Tempo de mistura</span><strong>{numero(O[5], 2)} <small>s</small></strong></Destaque>
                    <Destaque><span>Froude antes do ressalto</span><strong>{numero(O[3], 2)}</strong></Destaque>
                    <Destaque><span>Lâmina na medição (h0)</span><strong>{numero(H[0], 3)} <small>m</small></strong></Destaque>
                </Destaques>

                <BaixarRelatorio montar={montar} />

                {verificacoes.length > 0 && <>
                    <TituloBloco>Verificações da NBR 12216</TituloBloco>
                    <Verificacoes rotulo="Verificações da NBR 12216" itens={verificacoes} />
                </>}

                <Desenho ref={desenho} imagem={imgDesenho} largura={550} altura={350} titulo="Planta e corte da calha Parshall com as medidas calculadas" desenhar={desenhar} />

                <CaixaTabela $estreita>
                    <Tabela>
                        <caption>Resultados do ressalto</caption>
                        <thead><tr><th scope="col">Grandeza</th><th scope="col">Valor</th></tr></thead>
                        <tbody>
                            {linhas.map(([s, d, u, x, c]) => (
                                <tr key={s}>
                                    <th scope="row">{s}{u && <> <Unidade>({u})</Unidade></>}<Descricao>{d}</Descricao></th>
                                    <td>{numero(x, c)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Tabela>
                </CaixaTabela>
            </>}

            {semSolucao && <Aviso>Use uma calha de garganta maior para esta vazão.</Aviso>}
            <Paragrafo style={{ fontSize: 13 }}>Pré-dimensionamento para fins didáticos e de estudo; confira o projeto com a norma e um responsável técnico.</Paragrafo>

            <BarraAcoes>
                <CancelButton type="button" onClick={onVoltar}>Voltar aos dados</CancelButton>
                <span />
            </BarraAcoes>
        </>
    );
}
