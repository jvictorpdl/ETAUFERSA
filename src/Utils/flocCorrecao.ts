// Recalcula as câmaras cujo G calculado passou de 70 s-1, usando como alvo
// 70·(1 − FC/100). Todas as câmaras acima do limite são corrigidas juntas.
// M1 = [n, e, V1, V2, Δhd, Δhl, Δh, G] (uma coluna por câmara); t em minutos.
// Devolve a tabela corrigida, ou undefined se nenhuma câmara passou de 70.
export function corrigirCamaras(M1: number[][], t: number[], a: number, L: number, q: number, FC: number) {
    const acima = M1[7].map((G, i) => (G > 70 ? i : -1)).filter((i) => i >= 0);
    if (acima.length === 0) return undefined;

    const M2 = M1.map((linha) => linha.slice());
    const Galvo = 70 - 70 * (FC / 100);
    acima.forEach((i) => {
        const n = Math.ceil(0.045 * Math.pow(Math.pow((a * L * Galvo) / q, 2) * t[i], 1 / 3));
        const e = L / n;
        const V1 = q / (a * e);
        const V2 = (2 / 3) * V1;
        const l = t[i] * 60 * V1;
        const rh = (a * e) / (2 * (a + e));
        const dhd = Math.pow((q * 0.013) / (a * e * Math.pow(rh, 2 / 3)), 2) * l;
        const dhl = (n * V1 * V1 + (n - 1) * V2 * V2) / (2 * 9.81);
        const dh = dhd + dhl;
        const G = Math.sqrt((9.81 * dh) / (1e-6 * t[i] * 60));
        [n, e, V1, V2, dhd, dhl, dh, G].forEach((v, k) => {
            M2[k][i] = v;
        });
    });
    return M2;
}
