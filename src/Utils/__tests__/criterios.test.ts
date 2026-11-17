import { criteriosCoagulacao, criteriosFiltracao, criteriosFloculacao } from '../criterios';
import { lerNumero, numero } from '../../components/ui/formato';

describe('Verificações da NBR 12216', () => {
  test('mistura rápida: G, T e Froude', () => {
    const [g, t, fr] = criteriosCoagulacao(952, 1.36, 3.26);
    expect(g.ok).toBe(true);
    expect(t.ok).toBe(true);
    expect(fr.ok).toBe(false); // 2,5 a 4,5: ressalto oscilante
    expect(criteriosCoagulacao(1200, 6, 5).map((i) => i.ok)).toEqual([false, false, true]);
  });

  test('floculação: tempo, G das câmaras extremas, velocidade e espaçamento', () => {
    const ok = criteriosFloculacao(24, [65, 40, 20], [0.2, 0.15, 0.12], [0.7, 0.8, 0.9]);
    expect(ok.every((i) => i.ok)).toBe(true);
    const ruim = criteriosFloculacao(35, [80, 40, 8], [0.35, 0.15, 0.05], [0.3, 0.8, 0.9]);
    expect(ruim.every((i) => !i.ok)).toBe(true);
  });

  test('filtração em camada dupla', () => {
    const ok = criteriosFiltracao(240, { altura: 0.3, d10: 0.45, cu: 1.4 }, { altura: 0.5, d10: 0.9, cu: 1.4 });
    expect(ok.every((i) => i.ok)).toBe(true);
    const ruim = criteriosFiltracao(400, { altura: 0.2, d10: 0.5, cu: 1.8 }, { altura: 0.4, d10: 1.2, cu: 1.6 });
    expect(ruim.every((i) => !i.ok)).toBe(true);
  });
});

describe('Formato de números', () => {
  test('vírgula decimal e milhar com ponto', () => {
    expect(numero(25920, 0)).toBe('25.920');
    expect(numero(0.3704, 2)).toBe('0,37');
    expect(numero(NaN)).toBe('—');
  });

  test('lê vírgula ou ponto', () => {
    expect(lerNumero('0,055')).toBeCloseTo(0.055);
    expect(lerNumero('4.5')).toBeCloseTo(4.5);
    expect(lerNumero('')).toBeNaN();
    expect(lerNumero('1,2,3')).toBeNaN();
  });
});
