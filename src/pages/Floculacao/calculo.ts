import Floc from '../../Utils/Floc';
import Floc3 from '../../Utils/Floc3';
import Floc5 from '../../Utils/Floc5';

export interface EntradaFloc {
    q: number;
    t: number;
    nc: number;
    prof: number;
    nd: number;
    l: number;
    G: number[];
}

export interface ResultadoFloc {
    original: number[][]; // [n, e, V1, V2, Δhd, Δhl, Δht, G] por câmara
    corrigida?: number[][]; // só quando alguma câmara passa de 70 s⁻¹
    q: number;
    vol: number;
    area: number;
    B: number;
    a: number;
}

// Escolhe o floculador pelo número de câmaras e devolve as tabelas com nomes claros
export function calcularFloc(e: EntradaFloc, fator: number): ResultadoFloc {
    const [g1, g2, g3, g4, g5] = e.G;
    const r: any[] = e.nc === 3
        ? Floc3.floc(e.q, e.t, e.nc, e.prof, e.nd, e.l, g1, g2, g3, fator)
        : e.nc === 4
            ? Floc.floc(e.q, e.t, e.nc, e.prof, e.nd, e.l, g1, g2, g3, g4, fator)
            : Floc5.floc(e.q, e.t, e.nc, e.prof, e.nd, e.l, g1, g2, g3, g4, g5, fator);
    const [M22, , M11, q, vol, area, B, a] = r;
    return { original: M11, corrigida: M22, q, vol, area, B, a };
}
