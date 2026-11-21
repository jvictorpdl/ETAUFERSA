import {
  REGRAS_DECANTACAO, REGRAS_FILTRACAO, REGRAS_FLOCULACAO_DADOS, regrasGradientes, validarCampos, validarFiltracao,
} from '../validacao';
import { calcularFiltr, criteriosProjetoFiltro, EntradaFiltr } from '../../pages/Filtracao/calculo';
import { lerNumero } from '../../components/ui/formato';

const dadosFiltracao: Record<string, string> = {
  'geral.q': '0,3', 'geral.taxa': '240', 'geral.nd': '2', 'geral.ldec': '10', 'geral.lcalha': '1', 'geral.ncalhas': '3', 'geral.ar': '15',
  'areia.altura': '0,3', 'areia.def': '0,55', 'areia.cu': '1,4', 'areia.massa': '2650', 'areia.porosidade': '0,42', 'areia.esfericidade': '0,8', 'areia.d10': '0,45',
  'antracito.altura': '0,5', 'antracito.def': '1', 'antracito.cu': '1,4', 'antracito.massa': '1400', 'antracito.porosidade': '0,5', 'antracito.esfericidade': '0,7', 'antracito.d10': '0,9',
  'suporte.altura': '0,4', 'suporte.porosidade': '0,4', 'suporte.esfericidade': '0,8', 'suporte.d10': '3', 'suporte.d90': '25',
};
const grupos = Object.keys(REGRAS_FILTRACAO);
const errosFiltracao = (d: Record<string, string>) => grupos.flatMap((g) => validarFiltracao(d, g));

describe('Validação das entradas', () => {
  test('campos vazios viram uma mensagem só, com todos os campos', () => {
    const erros = validarCampos({ q: '', vs: '40', ns: '', prof: '4' }, REGRAS_DECANTACAO);
    expect(erros).toHaveLength(1);
    expect(erros[0].campos).toEqual(['q', 'ns']);
  });

  test('número de unidades precisa ser inteiro de pelo menos 1', () => {
    const erros = validarCampos({ q: '0,3', vs: '40', ns: '1,5', prof: '4' }, REGRAS_DECANTACAO);
    expect(erros[0].mensagem).toBe('Informe para o número de unidades um número inteiro de pelo menos 1.');
  });

  test('floculação: dados e gradientes', () => {
    expect(validarCampos({ q: '0,3', t: '24', prof: '3,5', nd: '2', l: '5' }, REGRAS_FLOCULACAO_DADOS)).toEqual([]);
    expect(validarCampos({ g1: '70', g2: '0', g3: '20' }, regrasGradientes(3))[0].campos).toEqual(['g2']);
  });

  test('filtração com valores típicos passa', () => {
    expect(errosFiltracao(dadosFiltracao)).toEqual([]);
  });

  test.each([
    ['geral.ncalhas', '1', 'o número de calhas'],
    ['areia.porosidade', '1', 'a porosidade da areia'],
    ['antracito.massa', '900', 'a massa específica do antracito'],
    ['areia.esfericidade', '1,2', 'o coeficiente de esfericidade da areia'],
    ['areia.cu', '0,9', 'o coeficiente de uniformidade da areia'],
  ])('filtração recusa %s = %s', (campo, valor, nome) => {
    const erros = errosFiltracao({ ...dadosFiltracao, [campo]: valor });
    expect(erros).toHaveLength(1);
    expect(erros[0].campos).toEqual([campo]);
    expect(erros[0].mensagem).toContain(nome);
  });

  test('taxa de ar pode ser zero (lavagem só com água)', () => {
    expect(errosFiltracao({ ...dadosFiltracao, 'geral.ar': '0' })).toEqual([]);
  });

  test('calha de lavagem mais larga que meio decantador é recusada', () => {
    const erros = errosFiltracao({ ...dadosFiltracao, 'geral.lcalha': '5' });
    expect(erros[0].campos).toEqual(['geral.lcalha', 'geral.ldec']);
  });

  test('d90 da camada suporte maior que o d10', () => {
    expect(errosFiltracao({ ...dadosFiltracao, 'suporte.d90': '2' })[0].campos).toEqual(['suporte.d10', 'suporte.d90']);
  });
});

// Robustez: qualquer entrada que passa na validação dá resultados finitos
describe('Robustez da filtração', () => {
  const n = (d: Record<string, string>, k: string) => lerNumero(d[k]);
  const montar = (d: Record<string, string>): EntradaFiltr => {
    const meio = (g: string) => ({
      altura: n(d, `${g}.altura`), def: n(d, `${g}.def`), cu: n(d, `${g}.cu`), massa: n(d, `${g}.massa`),
      porosidade: n(d, `${g}.porosidade`), esfericidade: n(d, `${g}.esfericidade`), d10: n(d, `${g}.d10`),
    });
    return {
      q: n(d, 'geral.q'), taxa: n(d, 'geral.taxa'), nd: n(d, 'geral.nd'), ldec: n(d, 'geral.ldec'), lcalha: n(d, 'geral.lcalha'),
      ncalhas: n(d, 'geral.ncalhas'), ar: n(d, 'geral.ar'), areia: meio('areia'), antracito: meio('antracito'),
      suporte: { altura: n(d, 'suporte.altura'), porosidade: n(d, 'suporte.porosidade'), esfericidade: n(d, 'suporte.esfericidade'), d10: n(d, 'suporte.d10'), d90: n(d, 'suporte.d90') },
    };
  };
  // gerador simples e repetível
  let semente = 42;
  const sorteio = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };
  const entre = (a: number, b: number) => a + (b - a) * sorteio();
  const fmt = (x: number) => String(Number(x.toFixed(4))).replace('.', ',');

  test('500 combinações plausíveis sem NaN, infinito ou valor negativo', () => {
    let validas = 0;
    for (let i = 0; i < 500; i++) {
      const d: Record<string, string> = { ...dadosFiltracao };
      d['geral.q'] = fmt(entre(0.01, 3));
      d['geral.taxa'] = fmt(entre(120, 480));
      d['geral.nd'] = String(Math.ceil(entre(0, 6)));
      d['geral.ldec'] = fmt(entre(3, 30));
      d['geral.lcalha'] = fmt(entre(0.2, 3));
      d['geral.ncalhas'] = String(Math.ceil(entre(1, 6)));
      d['geral.ar'] = fmt(entre(0, 25));
      ['areia', 'antracito'].forEach((g) => {
        d[`${g}.altura`] = fmt(entre(0.15, 1));
        d[`${g}.def`] = fmt(entre(0.3, 1.5));
        d[`${g}.cu`] = fmt(entre(1, 2));
        d[`${g}.massa`] = fmt(g === 'areia' ? entre(2400, 2700) : entre(1300, 1700));
        d[`${g}.porosidade`] = fmt(entre(0.35, 0.6));
        d[`${g}.esfericidade`] = fmt(entre(0.5, 1));
        d[`${g}.d10`] = fmt(entre(0.3, 1.2));
      });
      if (errosFiltracao(d).length) continue;
      validas++;
      const r = calcularFiltr(montar(d));
      // a lâmina sobre o leito pode ficar negativa (perda de carga maior que a carga disponível):
      // isso é um resultado de projeto e a verificação precisa apontar
      const { lamina, ...lavagem } = r.lavagem;
      const valores = JSON.stringify({ ...r, lavagem }, (_, v) => (typeof v === 'number' && (!Number.isFinite(v) || v < 0) ? `RUIM ${v}` : v));
      expect(valores).not.toContain('RUIM');
      expect(Number.isFinite(lamina)).toBe(true);
      expect(criteriosProjetoFiltro(r)[0].ok).toBe(lamina > 0);
    }
    expect(validas).toBeGreaterThan(300);
  });
});
