import Dec from '../Dec';
import Filtr from '../Filtr';

describe('Decantador convencional (dec)', () => {
  // dec(Q m³/s, vs m³/m²·d, Ns unidades, H m)
  const casos: Array<[number, number, number, number]> = [
    [0.3, 40, 2, 4.5],
    [0.05, 25, 2, 4.0],
    [1.0, 35, 4, 4.5],
  ];
  test.each(casos)('Q=%p vs=%p Ns=%p H=%p: dimensões coerentes', (Q, vs, Ns, H) => {
    const [V1, V2, V3] = Dec.dec(Q, vs, Ns, H);
    const [As, t, B, L, v0] = V1;
    const [Qll, lvv, Lc, nn, e] = V2;
    const [, , Qq] = V3;
    [...V1, ...V2, ...V3].forEach((x) => expect(Number.isFinite(x) && x > 0).toBe(true));
    expect(Qq).toBeCloseTo(Q / Ns, 10);
    expect(As).toBeCloseTo((Qq * 86400) / vs, 6);
    expect(B * L).toBeCloseTo(As, 6);
    expect(t).toBeCloseTo((As * H) / Qq, 6); // segundos
    expect(v0).toBeCloseTo((Qq / (B * H)) * 100, 6);
    expect(Lc).toBeCloseTo(0.2 * L, 6);
    expect(lvv).toBeCloseTo(2 * nn * Lc, 6);
    expect(Qll * lvv).toBeCloseTo(Qq * 1000, 6); // L/s
    expect(Qll).toBeLessThanOrEqual(Math.min(0.018 * H * vs, 1.8) + 1e-9); // NBR 12216, 5.10.8
    expect(e * nn).toBeCloseTo(B, 6);
  });
});

describe('Critérios da NBR 12216 para o decantador (criterios)', () => {
  // [Q m³/s, vs, Ns, v0 cm/s] -> capacidade, taxa máx, V0 máx, unidades mín
  test.each([
    [0.01, 25, 1, 0.4, 25, 0.5, 1],    // 864 m³/dia
    [0.1, 35, 1, 0.4, 35, 0.5, 1],     // 8.640 m³/dia
    [0.3, 40, 2, 0.7, 40, 0.75, 2],    // 25.920 m³/dia
  ])('Q=%p: limites por capacidade', (Q, vs, Ns, v0, taxaMax, v0Max, unMin) => {
    const c = Dec.criterios(Q, vs, Ns, v0);
    expect(c.capacidade).toBeCloseTo(Q * 86400, 6);
    expect(c.taxa.maximo).toBe(taxaMax);
    expect(c.v0.maximo).toBe(v0Max);
    expect(c.unidades.minimo).toBe(unMin);
    expect(c.taxa.ok && c.v0.ok && c.unidades.ok).toBe(true);
  });

  test('acima de 10.000 m³/dia com uma unidade só e V0 acima de 0,75: não atende', () => {
    const c = Dec.criterios(0.3, 45, 1, 0.8);
    expect(c.taxa.ok).toBe(false);
    expect(c.v0.ok).toBe(false);
    expect(c.unidades.ok).toBe(false);
  });

  test('até 10.000 m³/dia: V0 acima de 0,50 não atende', () => {
    expect(Dec.criterios(0.1, 30, 1, 0.6).v0.ok).toBe(false);
  });
});

describe('Filtro de dupla camada (filtr)', () => {
  // Entradas na ordem da página Filtração
  const ent = {
    Q: 0.3, q: 240, Nd: 2, L: 10, Lcl: 1,
    deefar: 0.55, deefant: 1.0, d10ar: 0.45, d10ant: 0.9, cuar: 1.4, cuant: 1.4,
    roar: 2650, roant: 1400, e0ar: 0.42, e0ant: 0.5, ecs: 0.4, qdar: 0.015, ncalhas: 3,
    lar: 0.3, lant: 0.5, lcs: 0.4, twar: 0.8, twant: 0.7, twcs: 0.8, d10cs: 3, d90cs: 25,
  };
  const roda = (o: typeof ent) => Filtr.filtr(o.Q, o.q, o.Nd, o.L, o.Lcl, o.deefar, o.deefant, o.d10ar, o.d10ant,
    o.cuar, o.cuant, o.roar, o.roant, o.e0ar, o.e0ant, o.ecs, o.qdar, o.ncalhas, o.lar, o.lant, o.lcs,
    o.twar, o.twant, o.twcs, o.d10cs, o.d90cs);

  // Oráculo independente: Wen & Yu (1966), Re_mf = sqrt(33,7² + 0,0408·Ga) − 33,7
  const vmfWenYu = (d10: number, cu: number, rs: number) => {
    const d90 = d10 * Math.pow(cu, 1.67) * 1e-3;
    const mu = 1.01e-3;
    const Ga = (d90 ** 3 * 1000 * (rs - 1000) * 9.81) / mu ** 2;
    const Re = Math.sqrt(33.7 ** 2 + 0.0408 * Ga) - 33.7;
    return (Re * mu) / (1000 * d90);
  };

  test('resultados finitos', () => {
    roda(ent).flat().forEach((x: number) => expect(Number.isFinite(x)).toBe(true));
  });

  test('Vmf da areia confere com Wen & Yu (±2%)', () => {
    const [, vMf] = roda(ent);
    const ref = vmfWenYu(ent.d10ar, ent.cuar, ent.roar);
    expect(Math.abs(vMf[0] / ref - 1)).toBeLessThan(0.02);
  });

  test('Vmf do antracito confere com Wen & Yu (±2%)', () => {
    const [, vMf] = roda(ent);
    const ref = vmfWenYu(ent.d10ant, ent.cuant, ent.roant);
    expect(Math.abs(vMf[1] / ref - 1)).toBeLessThan(0.02);
  });

  test('Vmf do leito misto fica entre os Vmf das duas camadas', () => {
    const [, vMf] = roda(ent);
    expect(vMf[2]).toBeLessThanOrEqual(Math.max(vMf[0], vMf[1]));
    expect(vMf[2]).toBeGreaterThanOrEqual(Math.min(vMf[0], vMf[1]));
  });

  test('camadas com o mesmo Vmf: Vmf do leito misto é definido', () => {
    const [, vMf] = roda({ ...ent, d10ant: ent.d10ar, cuant: ent.cuar, roant: ent.roar });
    expect(vMf[2]).toBeCloseTo(vMf[0], 6);
  });

  test('área e número de filtros coerentes', () => {
    const [, , , , , V4] = roda(ent);
    const [At, nad, Af] = V4;
    expect(At).toBeCloseTo((ent.Q * 86400) / ent.q, 6);
    expect(Af * nad).toBeCloseTo(At, 6);
    expect(nad).toBeGreaterThanOrEqual(2 * ent.Nd);
  });
});
