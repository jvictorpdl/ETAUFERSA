import Coag from '../Coag';

// Opções exibidas no <select> da página Coagulação (W em cm e faixa de Q em L/s)
const OPCOES = [
  { W: 7.6, qmin: 0.8, qmax: 53.8 },
  { W: 15.2, qmin: 1.4, qmax: 110.4 },
  { W: 22.9, qmin: 2.5, qmax: 252.0 },
  { W: 30.5, qmin: 3.1, qmax: 455.9 },
  { W: 45.7, qmin: 4.2, qmax: 696.6 },
  { W: 61.0, qmin: 11.9, qmax: 937.0 },
  { W: 91.5, qmin: 17.3, qmax: 1427.2 },
  { W: 122.0, qmin: 36.8, qmax: 1922.7 },
  { W: 152.5, qmin: 45.3, qmax: 2423.9 },
  { W: 183.0, qmin: 73.6, qmax: 2930.8 },
  { W: 213.5, qmin: 85.0, qmax: 3437.7 },
  { W: 244.0, qmin: 99.1, qmax: 3950.2 },
];

const g = 9.81;

describe('Tabela Parshall (valoresParshal)', () => {
  OPCOES.forEach((o, i) => {
    test(`opção ${i}: W da tabela bate com o rótulo W${o.W} cm`, () => {
      const v = Coag.valoresParshal(i);
      expect(v[0] * 100).toBeCloseTo(o.W, 0);
    });
    test(`opção ${i}: k e n positivos`, () => {
      const v = Coag.valoresParshal(i);
      expect(v[1]).toBeGreaterThan(0);
      expect(v[2]).toBeGreaterThan(0);
    });
  });

  test('D cresce com W (sem saltos para trás)', () => {
    const D = OPCOES.map((_, i) => Coag.valoresParshal(i)[4]);
    for (let i = 1; i < D.length; i++) expect(D[i]).toBeGreaterThan(D[i - 1]);
  });

  // Oráculo independente: equações de descarga livre da ASTM D1941 / ISO 9826
  // (Q[ft³/s] = C·Ha[ft]^n; de 1 a 8 pés, C = 4W e n = 1,522·W^0,026)
  const astm = (Wft: number): [number, number] => {
    if (Wft === 0.25) return [0.992, 1.547];
    if (Wft === 0.5) return [2.06, 1.58];
    if (Wft === 0.75) return [3.07, 1.53];
    return [4 * Wft, 1.522 * Math.pow(Wft, 0.026)];
  };
  const PES = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 7, 8];
  PES.forEach((Wft, i) => {
    test(`opção ${i}: lâmina h0 bate com a equação ASTM (±3%)`, () => {
      const [C, n] = astm(Wft);
      const v = Coag.valoresParshal(i);
      const o = OPCOES[i];
      [o.qmin, Math.sqrt(o.qmin * o.qmax), o.qmax].forEach((qls) => {
        const Q = qls / 1000;
        const hAstm = Math.pow(Q / 0.0283168 / C, 1 / n) * 0.3048;
        const hApp = v[1] * Math.pow(Q, v[2]);
        expect(Math.abs(hApp / hAstm - 1)).toBeLessThan(0.03);
      });
    });
  });
});

describe('Ressalto na calha Parshall (coag)', () => {
  OPCOES.forEach((o, i) => {
    [o.qmin, Math.sqrt(o.qmin * o.qmax), o.qmax].forEach((qls) => {
      const Q = qls / 1000;
      test(`opção ${i}, Q=${qls.toFixed(1)} L/s: resultados finitos; positivos quando h3 > 0`, () => {
        const v = Coag.valoresParshal(i);
        const [V, H, O] = Coag.coag(Q, v);
        // sem solução (E0 menor que a energia crítica): a página mostra aviso
        const semSolucao = !Number.isFinite(V[1]);
        expect(semSolucao || [V[0], V[1], V[2], H[0], H[1], H[2]].every((x) => x > 0)).toBe(true);
        // h3 <= 0: a página mostra aviso de que h3, V3, T e G não valem
        const todosValidos = [...V, ...H, ...O].every((x) => Number.isFinite(x) && x > 0);
        expect(semSolucao || H[3] <= 0 || todosValidos).toBe(true);
      });

      test(`opção ${i}, Q=${qls.toFixed(1)} L/s: energia conservada e h2 conjugada de h1`, () => {
        const v = Coag.valoresParshal(i);
        const [V, H, O] = Coag.coag(Q, v);
        if (!Number.isFinite(V[1])) return; // sem solução: coberto pelo teste acima e pelo aviso
        const [, V1] = V;
        const [, h1, h2] = H;
        const E0 = O[2];
        expect(V1 * V1 / (2 * g) + h1).toBeCloseTo(E0, 4);
        // V1 deve ser a raiz supercrítica (Fr1 > 1) para haver ressalto
        expect(O[3]).toBeGreaterThan(1);
        expect(h2).toBeGreaterThan(h1);
      });
    });
  });
});

describe('Calha W7,6 cm (3") perto da vazão máxima', () => {
  const v = Coag.valoresParshal(0);
  test('até 38 L/s o ressalto tem solução', () => {
    const [V] = Coag.coag(0.038, v);
    expect(Number.isFinite(V[1])).toBe(true);
  });
  test('em 53,8 L/s a energia disponível fica abaixo da crítica (sem solução)', () => {
    const [V, , O] = Coag.coag(0.0538, v);
    const q = O[1];
    const Ec = 1.5 * Math.cbrt((q * q) / 9.81);
    expect(O[2]).toBeLessThan(Ec);
    expect(Number.isFinite(V[1])).toBe(false);
  });
});
