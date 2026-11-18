import { linha, nomeArquivo, Relatorio, relatorioCsv } from './modelo';

const r: Relatorio = {
  titulo: 'Decantação',
  descricao: 'Decantador; teste',
  conclusao: { titulo: 'Atende', atende: true, linhas: ['2 unidades'] },
  fornecidos: [{ titulo: 'Dados', linhas: [linha('Q', 'vazão', 0.3, 'm³/s', 4)] }],
  calculados: [{ titulo: 'Resultados', linhas: [linha('As', 'área', 324, 'm²', 1)] }],
  verificacoes: [{ ok: false, texto: 'V0 = 0,8 cm/s', detalhe: 'até 0,75' }],
  tabelas: [{ titulo: 'Câmaras', colunas: ['Câmara', 'G'], linhas: [[1, 89.3]], casas: [0, 1] }],
};

describe('Relatório para baixar', () => {
  test('nome do arquivo sem acento, com data e hora', () => {
    expect(nomeArquivo(r, new Date(2026, 10, 18, 9, 5), 'pdf')).toBe('eta-ufersa-decantacao-2026-11-18-0905.pdf');
    expect(nomeArquivo(r, new Date(2026, 10, 18, 9, 5), 'png', '-desenho')).toBe('eta-ufersa-decantacao-desenho-2026-11-18-0905.png');
  });

  test('CSV traz entradas, resultados, tabelas e verificações com vírgula decimal', () => {
    const csv = relatorioCsv(r, new Date(2026, 10, 18, 9, 5));
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Dados;Q;vazão;0,3;m³/s');
    expect(csv).toContain('Resultados;As;área;324;m²');
    expect(csv).toContain('1;89,3');
    expect(csv).toContain('Não atende;V0 = 0,8 cm/s;até 0,75');
    expect(csv).toContain('"Decantador; teste"');
  });
});
