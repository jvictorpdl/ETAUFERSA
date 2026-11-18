// Relatório de cada unidade, no mesmo formato do Calimpe-H20: valores fornecidos, valores
// calculados, verificações e o desenho. PDF, Word, Excel e CSV saem deste mesmo objeto.
import { numero } from '../components/ui/formato';

export interface Linha {
    rotulo: string;
    descricao: string;
    valor: number;
    casas: number;
    unidade: string;
}

export interface Grupo {
    titulo: string;
    linhas: Linha[];
}

export interface Tabela {
    titulo: string;
    colunas: string[];
    linhas: Array<Array<string | number>>;
    casas?: number[];
}

export interface Relatorio {
    titulo: string;
    descricao: string;
    conclusao: { titulo: string; linhas: string[]; atende: boolean };
    fornecidos: Grupo[];
    calculados: Grupo[];
    verificacoes: Array<{ ok: boolean; texto: string; detalhe?: string }>;
    tabelas: Tabela[];
    desenho?: { imagem: string; largura: number; altura: number };
}

export const linha = (rotulo: string, descricao: string, valor: number, unidade = '', casas = 3): Linha => ({ rotulo, descricao, valor, casas, unidade });

export const textoValor = (l: Linha) => numero(l.valor, l.casas);

export function textoGerado(data: Date) {
    return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// "eta-ufersa-coagulacao-2026-11-18-0930.pdf"
export function nomeArquivo(relatorio: Relatorio, data: Date, extensao: string, parte = '') {
    const p = (n: number) => String(n).padStart(2, '0');
    const unidade = relatorio.titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const quando = `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}-${p(data.getHours())}${p(data.getMinutes())}`;
    return `eta-ufersa-${unidade}${parte}-${quando}.${extensao}`;
}

export function celulaTabela(t: Tabela, valor: string | number, coluna: number) {
    return typeof valor === 'number' ? numero(valor, t.casas?.[coluna] ?? 3) : valor;
}

// CSV com ";" e vírgula decimal, como o Excel em português abre direto
export function relatorioCsv(r: Relatorio, gerado: Date) {
    const decimal = (v: number) => String(v).replace('.', ',');
    const escapar = (c: string) => (/[;"\r\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
    const cab = ['Grupo', 'Parâmetro', 'Descrição', 'Valor', 'Unidade'];
    const parametros = (grupos: Grupo[]) => grupos.flatMap((g) => g.linhas.map((l) => [g.titulo, l.rotulo, l.descricao, decimal(l.valor), l.unidade]));
    const linhas: string[][] = [
        [`Relatório ${r.titulo}`],
        [r.descricao],
        [`Gerado em ${textoGerado(gerado)}`],
        [],
        ['Conclusão'],
        [r.conclusao.titulo],
        ...r.conclusao.linhas.map((l) => [l]),
        [],
        ['Valores fornecidos'],
        cab,
        ...parametros(r.fornecidos),
        [],
        ['Valores calculados'],
        cab,
        ...parametros(r.calculados),
        ...r.tabelas.flatMap((t) => [[], [t.titulo], t.colunas, ...t.linhas.map((l) => l.map((v) => (typeof v === 'number' ? decimal(v) : v)))]),
        ...(r.verificacoes.length ? [[], ['Verificações'], ['Situação', 'Critério', 'Referência'], ...r.verificacoes.map((v) => [v.ok ? 'Atende' : 'Não atende', v.texto, v.detalhe ?? ''])] : []),
    ];
    return `﻿${linhas.map((l) => l.map(escapar).join(';')).join('\r\n')}\r\n`;
}
