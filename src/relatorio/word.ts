import {
    AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, Packer, PageNumber, Paragraph,
    ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';
import { celulaTabela, Grupo, Linha, Relatorio, textoGerado, textoValor } from './modelo';

const VERDE = '17737A';
const TEXTO = '374151';
const CINZA = '6B7280';
const LARGURA_TABELA = 9070; // A4 com margens padrão, em DXA
const LARGURA_IMAGEM = 600;
const borda = { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };

function celula(texto: string, largura: number, o: { negrito?: boolean; cor?: string; fundo?: string; direita?: boolean; colunas?: number } = {}) {
    return new TableCell({
        width: { size: largura, type: WidthType.DXA },
        columnSpan: o.colunas ?? 1,
        borders: bordas,
        margins: { top: 50, bottom: 50, left: 80, right: 80 },
        shading: o.fundo ? { type: ShadingType.CLEAR, fill: o.fundo, color: 'auto' } : undefined,
        children: [new Paragraph({
            alignment: o.direita ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [new TextRun({ text: texto, bold: o.negrito, color: o.cor ?? TEXTO, size: 19 })],
        })],
    });
}

function tabela(larguras: number[], cabecalho: string[], linhas: TableRow[]) {
    return new Table({
        width: { size: LARGURA_TABELA, type: WidthType.DXA },
        columnWidths: larguras,
        rows: [
            new TableRow({ tableHeader: true, children: cabecalho.map((t, i) => celula(t, larguras[i], { negrito: true, cor: 'FFFFFF', fundo: VERDE })) }),
            ...linhas,
        ],
    });
}

const LARGURAS = [1400, 4470, 1600, 1600];
const linhaParametro = (l: Linha) => new TableRow({
    children: [
        celula(l.rotulo, LARGURAS[0], { negrito: true }),
        celula(l.descricao, LARGURAS[1]),
        celula(textoValor(l), LARGURAS[2], { direita: true }),
        celula(l.unidade, LARGURAS[3]),
    ],
});
const parametros = (grupos: Grupo[]) => tabela(LARGURAS, ['Parâmetro', 'Descrição', 'Valor', 'Unidade'], grupos.flatMap((g) => [
    new TableRow({ children: [celula(g.titulo, LARGURA_TABELA, { negrito: true, fundo: 'ECF5F6', colunas: 4 })] }),
    ...g.linhas.map(linhaParametro),
]));

const titulo2 = (text: string) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, bold: true, color: TEXTO, size: 24 })],
});

export async function gerarWord(r: Relatorio, gerado: Date): Promise<Blob> {
    const bytes = (img: string) => Uint8Array.from(atob(img.split(',')[1]), (c) => c.charCodeAt(0));
    const documento = new Document({
        creator: 'ETA UFERSA',
        title: `Relatório ${r.titulo}`,
        styles: { default: { document: { run: { font: 'Calibri', size: 22, color: TEXTO } } } },
        sections: [{
            footers: {
                default: new Footer({
                    children: [new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ color: CINZA, size: 16, children: [`ETA UFERSA · ${r.titulo} · Página `, PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES] })],
                    })],
                }),
            },
            children: [
                new Paragraph({ children: [new TextRun({ text: 'ETA UFERSA · FACEU', bold: true, color: VERDE, size: 20 })] }),
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: `Relatório ${r.titulo}`, bold: true, color: TEXTO, size: 36 })] }),
                new Paragraph({ children: [new TextRun({ text: r.descricao, color: CINZA, size: 20 })] }),
                new Paragraph({ children: [new TextRun({ text: `Gerado em ${textoGerado(gerado)}`, color: CINZA, size: 18 })] }),

                titulo2('Conclusão'),
                new Paragraph({ children: [new TextRun({ text: r.conclusao.titulo, bold: true, color: r.conclusao.atende ? '047857' : 'B91C1C' })] }),
                ...r.conclusao.linhas.map((l) => new Paragraph({ children: [new TextRun(l)] })),

                titulo2('Valores fornecidos'),
                parametros(r.fornecidos),
                titulo2('Valores calculados'),
                parametros(r.calculados),

                ...r.tabelas.flatMap((t) => {
                    const larguras = t.colunas.map(() => Math.floor(LARGURA_TABELA / t.colunas.length));
                    return [titulo2(t.titulo), tabela(larguras, t.colunas, t.linhas.map((l) => new TableRow({
                        children: l.map((v, i) => celula(celulaTabela(t, v, i), larguras[i], { direita: i > 0 })),
                    })))];
                }),

                ...(r.verificacoes.length ? [
                    titulo2('Verificações'),
                    tabela([1800, 3800, 3470], ['Situação', 'Critério', 'Referência'], r.verificacoes.map((v) => new TableRow({
                        children: [
                            celula(v.ok ? '✓ Atende' : '✗ Não atende', 1800, { negrito: true, cor: v.ok ? '047857' : 'B91C1C' }),
                            celula(v.texto, 3800),
                            celula(v.detalhe ?? '', 3470),
                        ],
                    }))),
                ] : []),

                ...(r.desenho ? [
                    titulo2('Desenho'),
                    new Paragraph({
                        children: [new ImageRun({
                            data: bytes(r.desenho.imagem),
                            transformation: { width: LARGURA_IMAGEM, height: Math.round(LARGURA_IMAGEM * r.desenho.altura / r.desenho.largura) },
                        })],
                    }),
                ] : []),
            ],
        }],
    });
    return Packer.toBlob(documento);
}
