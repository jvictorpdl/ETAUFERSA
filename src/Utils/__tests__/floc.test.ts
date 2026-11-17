import Floc from '../Floc';
import Floc3 from '../Floc3';
import Floc5 from '../Floc5';

// Floculador hidráulico de chicanas verticais
// floc(Q m³/s, T min, Nc canais, H m, Nd unidades, L m, G1..Gn s-1, FC %)
const base = { Q: 0.3, T: 24, Nc: 4, H: 3.5, Nd: 2, L: 5, FC: 10 };
const g = 9.81;
const nu = 1e-6;

type Res = any[];
function roda(Gs: number[]): Res {
  const { Q, T, Nc, H, Nd, L, FC } = base;
  if (Gs.length === 3) return Floc3.floc(Q, T, Nc, H, Nd, L, Gs[0], Gs[1], Gs[2], FC);
  if (Gs.length === 4) return Floc.floc(Q, T, Nc, H, Nd, L, Gs[0], Gs[1], Gs[2], Gs[3], FC);
  return Floc5.floc(Q, T, Nc, H, Nd, L, Gs[0], Gs[1], Gs[2], Gs[3], Gs[4], FC);
}

// tempo de cada câmara (min) reconstruído pelos resultados: G = sqrt(g·Δh / (ν·t·60))
const tempos = (M: any[]) => M[6].map((dh: number, i: number) => (g * dh) / (nu * 60 * M[7][i] ** 2));

const casos: Record<string, number[]> = {
  '3 câmaras': [60, 40, 20],
  '4 câmaras': [60, 45, 30, 20],
  '5 câmaras': [60, 50, 40, 30, 20],
};

describe.each(Object.entries(casos))('Floculador %s, G dentro de 70 s-1', (_, Gs) => {
  test('todos os resultados são números finitos e positivos', () => {
    const [, , M11] = roda(Gs);
    M11.flat().forEach((x: number) => {
      expect(Number.isFinite(x)).toBe(true);
      expect(x).toBeGreaterThan(0);
    });
  });

  test('os tempos das câmaras somam o tempo total', () => {
    const [, , M11] = roda(Gs);
    const soma = tempos(M11).reduce((a: number, b: number) => a + b, 0);
    expect(soma).toBeCloseTo(base.T, 6);
  });

  test('volume = Q/Nd · T e dimensões coerentes', () => {
    const [, , , q, Vol, A, B, a] = roda(Gs);
    expect(q).toBeCloseTo(base.Q / base.Nd, 10);
    expect(Vol).toBeCloseTo(q * base.T * 60, 6);
    expect(A * base.H).toBeCloseTo(Vol, 6);
    expect(B * base.L).toBeCloseTo(A, 6);
    expect(a * base.Nc).toBeCloseTo(B, 6);
  });
});

describe('Correção quando G calculado passa de 70 s-1', () => {
  const altos: Array<[string, number[], number]> = [
    ['3 câmaras, câmara 1', [95, 40, 20], 0],
    ['3 câmaras, câmara 3', [60, 40, 95], 2],
    ['4 câmaras, câmara 3', [60, 45, 95, 20], 2],
    ['4 câmaras, câmara 4', [60, 45, 30, 95], 3],
    ['5 câmaras, câmara 4', [60, 50, 40, 95, 20], 3],
    ['5 câmaras, câmara 5', [60, 50, 40, 30, 95], 4],
  ];
  test.each(altos)('%s: a tabela corrigida (M22) traz o G reduzido', (_, Gs, i) => {
    const [M22, , M11] = roda(Gs);
    expect(M11[7][i]).toBeGreaterThan(70);
    expect(M22).toBeDefined();
    expect(M22[7][i]).toBeLessThan(M11[7][i]);
  });

  test('duas câmaras acima de 70 (1 e 2): as duas são corrigidas', () => {
    const [M22, , M11] = roda([110, 95, 20]);
    expect(M11[7][0]).toBeGreaterThan(70);
    expect(M11[7][1]).toBeGreaterThan(70);
    expect(M22[7][0]).toBeLessThan(M11[7][0]);
    expect(M22[7][1]).toBeLessThan(M11[7][1]);
  });
});
