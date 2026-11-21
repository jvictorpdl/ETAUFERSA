// Resolve A·x = b por eliminação de Gauss com pivoteamento parcial.
// Substitui o mathjs, que pesava mais de 100 KB só para inverter uma matriz de até 5×5
// (os tempos das câmaras do floculador).
export function resolverSistema(A: number[][], b: number[]): number[] {
    const n = b.length;
    const M = A.map((linha, i) => [...linha, b[i]]);
    for (let c = 0; c < n; c++) {
        let pivo = c;
        for (let l = c + 1; l < n; l++) if (Math.abs(M[l][c]) > Math.abs(M[pivo][c])) pivo = l;
        if (Math.abs(M[pivo][c]) < 1e-12) throw new Error('Sistema sem solução única');
        [M[c], M[pivo]] = [M[pivo], M[c]];
        for (let l = c + 1; l < n; l++) {
            const f = M[l][c] / M[c][c];
            for (let k = c; k <= n; k++) M[l][k] -= f * M[c][k];
        }
    }
    const x = new Array(n).fill(0);
    for (let l = n - 1; l >= 0; l--) {
        let s = M[l][n];
        for (let k = l + 1; k < n; k++) s -= M[l][k] * x[k];
        x[l] = s / M[l][l];
    }
    return x;
}
