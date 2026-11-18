import React, { useRef, useState } from 'react';
import Dec from '../../Utils/Dec';
import Layout from '../../components/ui/Layout';
import Calculadora from '../../components/ui/Calculadora';
import { Campo } from '../../components/ui/Campo';
import { ItemAjuda, PainelAjuda } from '../../components/ui/Ajuda';
import Desenho, { capturarDesenho } from '../../components/ui/Desenho';
import BaixarRelatorio from '../../components/ui/BaixarRelatorio';
import { linha, Relatorio } from '../../relatorio/modelo';
import Verificacoes, { Verificacao } from '../../components/ui/Verificacoes';
import useDados from '../../components/ui/useDados';
import { lerNumero, numero } from '../../components/ui/formato';
import {
    ActionButton, BarraAcoes, CaixaTabela, CancelButton, Column, Conclusao,
    Descricao, Destaque, Destaques, FormTitle, Grid, MensagemErro, Paragrafo, Row, Secao, Tabela, TituloBloco, Unidade, VerticalSplitter,
} from '../../components/ui/estilos';
import img3 from '../../assets/images/dec3.png';
import img4 from '../../assets/images/dec4.png';
import img5 from '../../assets/images/dec5.png';

const GRUPOS = ['Dados do decantador', 'Resultados'];

const CAMPOS = [
    { nome: 'q', rotulo: 'Q', unidade: 'm³/s', dica: 'Vazão total da ETA.', inteiro: false },
    { nome: 'vs', rotulo: 'vs', unidade: 'm³/m²·dia', dica: 'Taxa de aplicação superficial (velocidade de sedimentação). Sem ensaios, a NBR 12216 limita a 25, 35 ou 40 m³/m²·dia conforme a capacidade.', inteiro: false },
    { nome: 'ns', rotulo: 'Nº de unidades', unidade: '', dica: 'Número de decantadores iguais em paralelo. Acima de 10.000 m³/dia, a NBR 12216 pede pelo menos dois.', inteiro: true },
    { nome: 'prof', rotulo: 'H', unidade: 'm', dica: 'Profundidade útil do decantador.', inteiro: false },
] as const;

type Entrada = { q: number; vs: number; ns: number; prof: number };

export default function Decantacao() {
    const { dados, alterar, limpar, temDados } = useDados('decantacao', { q: '', vs: '', ns: '', prof: '' });
    const [grupo, setGrupo] = useState(GRUPOS[0]);
    const [calculo, setCalculo] = useState<Entrada | null>(null);
    const [invalidos, setInvalidos] = useState<string[]>([]);
    const desenho = useRef<HTMLCanvasElement>(null);

    function dimensionar() {
        const valores: Record<string, number> = {};
        const ruins: string[] = [];
        CAMPOS.forEach((c) => {
            const x = lerNumero(dados[c.nome]);
            if (!Number.isFinite(x) || x <= 0 || (c.inteiro && !Number.isInteger(x))) ruins.push(c.nome);
            valores[c.nome] = x;
        });
        setInvalidos(ruins);
        if (ruins.length) return;
        setCalculo(valores as Entrada);
        setGrupo('Resultados');
    }

    return (
        <Layout unidade="Decantação">
            <Calculadora
                titulo="Decantação"
                descricao="Dimensiona o decantador convencional de escoamento horizontal e confere os limites da NBR 12216"
                grupos={GRUPOS}
                grupo={grupo}
                bloqueados={calculo ? [] : ['Resultados']}
                onGrupo={setGrupo}
                onLimpar={temDados ? () => { limpar(); setCalculo(null); setInvalidos([]); setGrupo(GRUPOS[0]); } : undefined}
            >
                {grupo === GRUPOS[0] && <>
                    {invalidos.length > 0 &&
                        <MensagemErro role="alert">
                            Preencha os campos destacados com números maiores que zero{invalidos.includes('ns') ? ' (o número de unidades é inteiro)' : ''}.
                        </MensagemErro>}
                    <Row>
                        <Column>
                            <Secao>
                                <FormTitle>Dados do decantador</FormTitle>
                                <Grid $colunas={4}>
                                    {CAMPOS.map((c) => (
                                        <Campo key={c.nome} rotulo={c.rotulo} nome={c.nome} unidade={c.unidade || undefined} dica={c.dica}
                                            valor={dados[c.nome]} invalido={invalidos.includes(c.nome)}
                                            onChange={(v) => { alterar(c.nome, v); setInvalidos(invalidos.filter((x) => x !== c.nome)); }} />
                                    ))}
                                </Grid>
                            </Secao>
                        </Column>
                        <VerticalSplitter />
                        <Column>
                            <PainelAjuda>
                                <ItemAjuda titulo="Limites da NBR 12216">
                                    <p>Sem ensaios, decantador convencional (item 5.10): taxa de até 25 m³/m²·dia até 1.000 m³/dia, 35 até 10.000 e 40 acima disso.</p>
                                    <p>Velocidade longitudinal V0 de até 0,50 cm/s até 10.000 m³/dia e 0,75 cm/s acima, com bom controle operacional.</p>
                                    <p>Vazão por metro de vertedor de até 1,8 L/s·m.</p>
                                </ItemAjuda>
                                <ItemAjuda titulo="Como o decantador é desenhado">
                                    <p>A largura B sai da área com comprimento igual a 4 vezes a largura, arredondada para cima em metros. As calhas de coleta ocupam 20 % do comprimento.</p>
                                </ItemAjuda>
                            </PainelAjuda>
                        </Column>
                    </Row>
                    <BarraAcoes>
                        <span />
                        <ActionButton type="button" onClick={dimensionar}>Dimensionar</ActionButton>
                    </BarraAcoes>
                </>}

                {grupo === 'Resultados' && calculo && <Resultados e={calculo} desenho={desenho} onVoltar={() => setGrupo(GRUPOS[0])} />}
            </Calculadora>
        </Layout>
    );
}

function Resultados({ e, desenho, onVoltar }: { e: Entrada; desenho: React.RefObject<HTMLCanvasElement>; onVoltar: () => void }) {
    const [V1, V2, V3] = Dec.dec(e.q, e.vs, e.ns, e.prof);
    const nbr = Dec.criterios(e.q, e.vs, e.ns, V1[4]);
    const cap = numero(nbr.capacidade, 0);
    const itens: Verificacao[] = [
        { ok: nbr.taxa.ok, texto: `Taxa de aplicação = ${numero(nbr.taxa.valor, 1)} m³/m²·dia`, detalhe: `NBR 12216, 5.10.4: até ${nbr.taxa.maximo} m³/m²·dia para ${cap} m³/dia` },
        { ok: nbr.v0.ok, texto: `Velocidade longitudinal V0 = ${numero(nbr.v0.valor, 2)} cm/s`, detalhe: `NBR 12216, 5.10.5: até ${numero(nbr.v0.maximo, 2)} cm/s${nbr.capacidade > 10000 ? ' com bom controle operacional; 1,00 com remoção contínua de lodo' : ''}` },
        { ok: nbr.unidades.ok, texto: `${nbr.unidades.valor} unidade(s)`, detalhe: `NBR 12216, 5.10.2: pelo menos ${nbr.unidades.minimo} para ${cap} m³/dia` },
        { ok: V2[0] <= 1.8 + 1e-9, texto: `Vazão por metro de vertedor = ${numero(V2[0], 2)} L/s·m`, detalhe: 'NBR 12216, 5.10.8: até 1,8 L/s·m sem ensaios' },
        { ok: V3[0] < 20000, texto: `Número de Reynolds = ${numero(V3[0], 0)}`, detalhe: 'Critério de projeto: menor que 20.000' },
        { ok: V3[1] >= 3 && V3[1] <= 4, texto: `Relação L/B = ${numero(V3[1], 2)}`, detalhe: 'Critério de projeto: entre 3 e 4' },
    ];
    const atende = itens.every((i) => i.ok);
    const imagem = e.ns <= 3 ? img3 : e.ns === 4 ? img4 : img5;

    const linhas: Array<[string, string, string, number, number]> = [
        ['As', 'área superficial de cada unidade', 'm²', V1[0], 1],
        ['t', 'tempo de detenção', 'h', V1[1] / 3600, 2],
        ['B', 'largura', 'm', V1[2], 0],
        ['L', 'comprimento', 'm', V1[3], 2],
        ['V0', 'velocidade longitudinal', 'cm/s', V1[4], 3],
        ['Ql', 'vazão por metro de vertedor', 'L/s·m', V2[0], 3],
        ['Lv', 'comprimento total de vertedor', 'm', V2[1], 2],
        ['Lc', 'comprimento de cada calha', 'm', V2[2], 2],
        ['n', 'número de calhas', '', V2[3], 0],
        ['S', 'espaçamento entre calhas', 'm', V2[4], 2],
        ['Re', 'número de Reynolds', '', V3[0], 0],
        ['L/B', 'relação comprimento/largura', '', V3[1], 2],
    ];

    const montar = (): Relatorio => ({
        titulo: 'Decantação',
        descricao: 'Decantador convencional de escoamento horizontal, com os limites da NBR 12216',
        conclusao: {
            titulo: atende ? 'O decantador atende aos critérios verificados' : 'O decantador não atende a todos os critérios',
            atende,
            linhas: [`${numero(e.ns, 0)} unidade(s) de ${numero(V1[2], 0)} m × ${numero(V1[3], 2)} m para ${cap} m³/dia.`],
        },
        fornecidos: [{
            titulo: 'Dados do decantador',
            linhas: [
                linha('Q', 'vazão total da ETA', e.q, 'm³/s', 4),
                linha('vs', 'taxa de aplicação superficial', e.vs, 'm³/m²·dia', 2),
                linha('Ns', 'número de unidades', e.ns, '', 0),
                linha('H', 'profundidade útil', e.prof, 'm', 2),
            ],
        }],
        calculados: [{ titulo: 'Decantador (por unidade)', linhas: [linha('Capacidade', 'capacidade da ETA', nbr.capacidade, 'm³/dia', 0), ...linhas.map(([s, d, u, x, c]) => linha(s, d, x, u, c))] }],
        verificacoes: itens,
        tabelas: [],
        desenho: capturarDesenho(desenho.current, 650, 366),
    });

    function desenhar(ctx: CanvasRenderingContext2D) {
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(`${numero(V1[3], 2)} m`, 350, 50);
        ctx.fillText(`${numero(V1[2], 0)} m`, 560, 152);
        ctx.fillText(`${numero(V2[2], 2)} m`, 445, 300);
    }

    return (
        <>
            <Conclusao $atende={atende} role="status">
                <strong>{atende ? 'O decantador atende aos critérios verificados' : 'O decantador não atende a todos os critérios'}</strong>
                {numero(e.ns, 0)} unidade(s) de {numero(V1[2], 0)} m × {numero(V1[3], 2)} m para {cap} m³/dia.
            </Conclusao>

            <Destaques>
                <Destaque><span>Largura × comprimento</span><strong>{numero(V1[2], 0)} × {numero(V1[3], 1)} <small>m</small></strong></Destaque>
                <Destaque><span>Área de cada unidade</span><strong>{numero(V1[0], 0)} <small>m²</small></strong></Destaque>
                <Destaque><span>Tempo de detenção</span><strong>{numero(V1[1] / 3600, 2)} <small>h</small></strong></Destaque>
                <Destaque><span>Calhas de coleta</span><strong>{numero(V2[3], 0)} <small>× {numero(V2[2], 2)} m</small></strong></Destaque>
            </Destaques>

            <BaixarRelatorio montar={montar} />

            <TituloBloco>Verificações</TituloBloco>
            <Verificacoes rotulo="Verificações do decantador" itens={itens} />

            <Desenho ref={desenho} imagem={imagem} largura={650} altura={366} titulo="Planta do decantador com as medidas calculadas" desenhar={desenhar} />

            <CaixaTabela $estreita>
                <Tabela>
                    <caption>Resultados por unidade</caption>
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

            <Paragrafo style={{ fontSize: 13 }}>Pré-dimensionamento para fins didáticos e de estudo; confira o projeto com a norma e um responsável técnico.</Paragrafo>
            <BarraAcoes>
                <CancelButton type="button" onClick={onVoltar}>Voltar aos dados</CancelButton>
                <span />
            </BarraAcoes>
        </>
    );
}
