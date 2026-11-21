import { resolverSistema } from '../algebra';

describe('resolverSistema', () => {
  test('sistema 3×3 conhecido', () => {
    const x = resolverSistema([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3]);
    [2, 3, -1].forEach((v, i) => expect(x[i]).toBeCloseTo(v, 10));
  });

  test('tempos das câmaras: G·t igual em todas e soma igual ao total', () => {
    const G = [60, 45, 30, 20];
    const A = [[1, 1, 1, 1], [G[0], -G[1], 0, 0], [0, G[1], -G[2], 0], [0, 0, G[2], -G[3]]];
    const t = resolverSistema(A, [25, 0, 0, 0]);
    expect(t.reduce((a, b) => a + b, 0)).toBeCloseTo(25, 10);
    t.forEach((ti, i) => expect(G[i] * ti).toBeCloseTo(G[0] * t[0], 10));
  });

  test('precisa trocar a ordem das linhas (pivô zero na diagonal)', () => {
    const x = resolverSistema([[0, 1], [1, 0]], [3, 4]);
    expect(x).toEqual([4, 3]);
  });

  test('sistema singular avisa', () => {
    expect(() => resolverSistema([[1, 2], [2, 4]], [1, 2])).toThrow('Sistema sem solução única');
  });
});
