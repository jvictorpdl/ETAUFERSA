// Verificações da NBR 12216 (ABNT, 1992) para as unidades sem ensaios de laboratório.
// Cada item diz o valor calculado, o limite e se atende.
import { numero } from '../components/ui/formato';

export interface Item {
    ok: boolean;
    texto: string;
    detalhe?: string;
}

// 5.8: mistura rápida com coagulante metálico — G entre 700 e 1100 s⁻¹ e tempo de até 5 s;
// ressalto com Froude entre 2,5 e 4,5 é oscilante e pede dispositivo que anule as oscilações
export function criteriosCoagulacao(G: number, T: number, Fr: number): Item[] {
    const oscilante = Fr >= 2.5 && Fr <= 4.5;
    return [
        {
            ok: G >= 700 && G <= 1100,
            texto: `Gradiente de velocidade G = ${numero(G, 0)} s⁻¹`,
            detalhe: 'NBR 12216, 5.8: entre 700 e 1.100 s⁻¹ para coagulantes metálicos',
        },
        {
            ok: T <= 5,
            texto: `Tempo de mistura T = ${numero(T, 2)} s`,
            detalhe: 'NBR 12216, 5.8: até 5 s',
        },
        {
            ok: !oscilante,
            texto: `Número de Froude Fr₁ = ${numero(Fr, 2)}${oscilante ? ' (ressalto oscilante)' : ''}`,
            detalhe: 'NBR 12216, 5.8.4: entre 2,5 e 4,5 é preciso um dispositivo que anule as oscilações a jusante',
        },
    ];
}

// 5.9: floculador hidráulico — 20 a 30 min, G até 70 s⁻¹ no primeiro compartimento e pelo menos
// 10 s⁻¹ no último; 5.9.6: chicanas com velocidade de 10 a 30 cm/s e espaçamento mínimo de 0,60 m
export function criteriosFloculacao(t: number, G: number[], V1: number[], e: number[]): Item[] {
    const vMin = Math.min(...V1) * 100;
    const vMax = Math.max(...V1) * 100;
    const eMin = Math.min(...e);
    return [
        {
            ok: t >= 20 && t <= 30,
            texto: `Tempo de floculação t = ${numero(t, 0)} min`,
            detalhe: 'NBR 12216, 5.9.2.1: de 20 a 30 min em floculadores hidráulicos',
        },
        {
            ok: G[0] <= 70,
            texto: `G na primeira câmara = ${numero(G[0], 1)} s⁻¹`,
            detalhe: 'NBR 12216, 5.9.2.2: até 70 s⁻¹',
        },
        {
            ok: G[G.length - 1] >= 10,
            texto: `G na última câmara = ${numero(G[G.length - 1], 1)} s⁻¹`,
            detalhe: 'NBR 12216, 5.9.2.2: pelo menos 10 s⁻¹',
        },
        {
            ok: vMin >= 10 && vMax <= 30,
            texto: `Velocidade entre chicanas de ${numero(vMin, 1)} a ${numero(vMax, 1)} cm/s`,
            detalhe: 'NBR 12216, 5.9.6: de 10 a 30 cm/s',
        },
        {
            ok: eMin >= 0.6,
            texto: `Menor espaçamento entre chicanas e = ${numero(eMin, 2)} m`,
            detalhe: 'NBR 12216, 5.9.6: mínimo de 0,60 m; pode ser menor se as chicanas forem removíveis',
        },
    ];
}

interface Camada {
    altura: number; // m
    d10: number; // mm
    cu: number;
}

// 5.12: filtro de camada dupla sem filtro-piloto
export function criteriosFiltracao(taxa: number, areia: Camada, antracito: Camada): Item[] {
    return [
        {
            ok: taxa <= 360,
            texto: `Taxa de filtração = ${numero(taxa, 0)} m³/m²·dia`,
            detalhe: 'NBR 12216, 5.12.5.1: até 360 m³/m²·dia em camada dupla',
        },
        {
            ok: areia.altura >= 0.25,
            texto: `Espessura da areia = ${numero(areia.altura, 2)} m`,
            detalhe: 'NBR 12216, 5.12.2.2: mínimo de 0,25 m',
        },
        {
            ok: areia.d10 >= 0.4 && areia.d10 <= 0.45,
            texto: `Tamanho efetivo da areia d10 = ${numero(areia.d10, 2)} mm`,
            detalhe: 'NBR 12216, 5.12.2.2: de 0,40 a 0,45 mm',
        },
        {
            ok: areia.cu >= 1.4 && areia.cu <= 1.6,
            texto: `Coeficiente de uniformidade da areia = ${numero(areia.cu, 2)}`,
            detalhe: 'NBR 12216, 5.12.2.2: de 1,4 a 1,6',
        },
        {
            ok: antracito.altura >= 0.45,
            texto: `Espessura do antracito = ${numero(antracito.altura, 2)} m`,
            detalhe: 'NBR 12216, 5.12.2.2: mínimo de 0,45 m',
        },
        {
            ok: antracito.d10 >= 0.8 && antracito.d10 <= 1.0,
            texto: `Tamanho efetivo do antracito d10 = ${numero(antracito.d10, 2)} mm`,
            detalhe: 'NBR 12216, 5.12.2.2: de 0,8 a 1,0 mm',
        },
        {
            ok: antracito.cu <= 1.4,
            texto: `Coeficiente de uniformidade do antracito = ${numero(antracito.cu, 2)}`,
            detalhe: 'NBR 12216, 5.12.2.2: até 1,4',
        },
    ];
}
