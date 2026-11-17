const Dec = {
    dec(Q:number, vs:number, Ns:number, H:number) {

        var Qq = Q / Ns;
        var As = (Qq / vs) * (86400);

        var t = (As * H) / Qq;

        var b = Math.sqrt(As / 4);
        var B = Math.ceil(b);
        var L = As / B;
        var cc = L / B;

        var V0 = Qq / (B * H);
        var v0 = V0 * 100;

        var RH = (B * H) / (B + 2 * H);
        var Re = V0 * RH / (Math.pow(10, -6));

        // NBR 12216, 5.10.8: q = 0,018·H·Vs (L/s·m) e, sem ensaios, no máximo 1,8 L/s·m
        // em decantador convencional (2,5 L/s·m só vale para fluxo vertical ou tubular)
        var Ql = Math.min(0.018 * H * vs, 1.8);

        var lv = (Qq * 1000) / Ql;

        var Lc = 0.2 * L;

        var n = lv / (2 * Lc)

        var nn = Math.ceil(n);
        var lvv = nn * Lc * 2;
        var Qll = (Qq * 1000) / lvv;

        var e = B / nn;

        var V1 = [As, t, B, L, v0];
        var V2 = [Qll, lvv, Lc, nn, e];
        var V3 = [Re,cc, Qq];
        return [V1,V2,V3];
    },

    // Critérios da NBR 12216 (item 5.10) para decantador convencional sem ensaios.
    // Q em m³/s (vazão total da ETA), vs em m³/m²·dia, v0 em cm/s.
    criterios(Q: number, vs: number, Ns: number, v0: number) {
        const capacidade = Q * 86400; // m³/dia
        const taxaMax = capacidade <= 1000 ? 25 : capacidade <= 10000 ? 35 : 40;
        const v0Max = capacidade <= 10000 ? 0.5 : 0.75;
        const unidadesMin = capacidade > 10000 ? 2 : 1;
        return {
            capacidade,
            taxa: { valor: vs, maximo: taxaMax, ok: vs <= taxaMax },
            v0: { valor: v0, maximo: v0Max, ok: v0 <= v0Max },
            unidades: { valor: Ns, minimo: unidadesMin, ok: Ns >= unidadesMin },
        };
    }
}

export default Dec;
