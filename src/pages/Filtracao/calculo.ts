import Filtr from '../../Utils/Filtr';

export interface Meio {
    altura: number; // m
    def: number; // mm, tamanho efetivo usado na relação L/d
    cu: number;
    massa: number; // kg/m³
    porosidade: number;
    esfericidade: number;
    d10: number; // mm
}

export interface EntradaFiltr {
    q: number; // m³/s
    taxa: number; // m³/m²·dia
    nd: number;
    ldec: number; // m
    lcalha: number; // m
    ncalhas: number;
    ar: number; // L/s·m²
    areia: Meio;
    antracito: Meio;
    suporte: { altura: number; porosidade: number; esfericidade: number; d10: number; d90: number };
}

// Chama Filtr.filtr na ordem de argumentos que ele espera e devolve os grupos de resultados
export function calcularFiltr(e: EntradaFiltr) {
    const { areia: a, antracito: n, suporte: s } = e;
    const [hf, vmf, V1, V2, V3, V4] = Filtr.filtr(
        e.q, e.taxa, e.nd, e.ldec, e.lcalha, a.def, n.def, a.d10, n.d10, a.cu, n.cu, a.massa, n.massa,
        a.porosidade, n.porosidade, s.porosidade, e.ar, e.ncalhas, a.altura, n.altura, s.altura,
        a.esfericidade, n.esfericidade, s.esfericidade, s.d10, s.d90,
    ) as number[][];
    return {
        perdas: { areia: hf[0], antracito: hf[1], total: hf[2], suporte: hf[3] },
        vmf: { areia: vmf[0], antracito: vmf[1], misto: vmf[2] },
        lavagem: { vazao: V1[0], volume: V1[1], reservacao: V1[2], tubulacao: V1[3], ar: V1[4], lamina: V1[5] },
        calhas: { B: V2[0], h0: V2[1], hMin: V2[2], hMax: V2[3], sMin: V2[4], sMax: V2[5], S: V2[6] },
        vertedor: { B: V3[0], h: V3[1] },
        ld: V3[2],
        filtros: { areaTotal: V4[0], numero: V4[1], area: V4[2], L: V4[3], Y: V4[4] },
    };
}

export type ResultadoFiltr = ReturnType<typeof calcularFiltr>;

// carga hidráulica disponível usada no cálculo da lâmina sobre o leito (Filtr.ts)
export const CARGA_DISPONIVEL = 2.55;

// Critérios de projeto do filtro que vêm do próprio dimensionamento
export function criteriosProjetoFiltro(r: ResultadoFiltr) {
    const f = (x: number, c = 2) => x.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
    return [
        {
            ok: r.lavagem.lamina > 0,
            texto: `Lâmina de água sobre o leito = ${f(r.lavagem.lamina)} m`,
            detalhe: `Critério de projeto: a perda de carga no leito limpo (${f(r.perdas.total + r.perdas.suporte)} m) precisa caber na carga disponível de ${f(CARGA_DISPONIVEL)} m`,
        },
        {
            ok: r.calhas.S >= r.calhas.sMin && r.calhas.S <= r.calhas.sMax,
            texto: `Espaçamento entre calhas S = ${f(r.calhas.S)} m`,
            detalhe: `Critério de projeto: entre 1,5 e 2,5 vezes a altura das calhas sobre o leito (${f(r.calhas.sMin)} a ${f(r.calhas.sMax)} m)`,
        },
        {
            ok: r.ld >= 1000,
            texto: `Relação espessura/diâmetro do meio (L/d) = ${f(r.ld, 0)}`,
            detalhe: 'Critério de projeto: pelo menos 1.000',
        },
    ];
}
