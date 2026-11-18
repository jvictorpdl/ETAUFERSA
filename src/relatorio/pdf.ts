import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import fonteRegular from '../assets/fontes/Inter-Regular.ttf';
import fonteSemiBold from '../assets/fontes/Inter-SemiBold.ttf';
import { celulaTabela, Grupo, Relatorio, textoGerado, textoValor } from './modelo';

const MARGEM = 18;
const VERDE: [number, number, number] = [23, 115, 122];
const TEXTO: [number, number, number] = [55, 65, 81];
const CINZA: [number, number, number] = [107, 114, 128];

// as fontes padrão do PDF não têm s⁻¹, Δ e os subscritos; o subconjunto da Inter tem
async function adicionarFonte(doc: jsPDF, url: string, arquivo: string, estilo: string) {
    const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
    let binario = '';
    bytes.forEach((b) => { binario += String.fromCharCode(b); });
    doc.addFileToVFS(arquivo, btoa(binario));
    doc.addFont(arquivo, 'Inter', estilo);
}

export async function gerarPdf(r: Relatorio, gerado: Date): Promise<Blob> {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    await adicionarFonte(doc, fonteRegular, 'Inter-Regular.ttf', 'normal');
    await adicionarFonte(doc, fonteSemiBold, 'Inter-SemiBold.ttf', 'bold');
    doc.setProperties({ title: `Relatório ${r.titulo}`, creator: 'ETA UFERSA' });

    const larguraPagina = doc.internal.pageSize.getWidth();
    const alturaPagina = doc.internal.pageSize.getHeight();
    const largura = larguraPagina - 2 * MARGEM;
    let y = MARGEM;

    const escrever = (texto: string, tamanho: number, estilo: string, cor: [number, number, number]) => {
        doc.setFont('Inter', estilo).setFontSize(tamanho).setTextColor(...cor);
        const linhas = doc.splitTextToSize(texto, largura);
        doc.text(linhas, MARGEM, y, { baseline: 'top' });
        y += doc.getTextDimensions(linhas).h;
    };
    const garantirEspaco = (altura: number) => {
        if (y + altura > alturaPagina - MARGEM) {
            doc.addPage();
            y = MARGEM;
        }
    };
    const secao = (texto: string, alturaConteudo = 24) => {
        garantirEspaco(alturaConteudo + 14);
        y += 6;
        escrever(texto, 12, 'bold', TEXTO);
        y += 2;
    };
    const tabela = (cabecalho: string[], corpo: any[][], colunas: Record<number, any>) => {
        autoTable(doc, {
            startY: y,
            head: [cabecalho],
            body: corpo,
            margin: { left: MARGEM, right: MARGEM, top: MARGEM, bottom: MARGEM },
            styles: { font: 'Inter', fontSize: 9, textColor: TEXTO, cellPadding: 1.8, lineColor: [229, 231, 235], lineWidth: 0.1 },
            headStyles: { fillColor: VERDE, textColor: 255, fontStyle: 'bold' },
            columnStyles: colunas,
            alternateRowStyles: { fillColor: [249, 250, 251] },
            didParseCell: ({ section, column, cell }) => {
                if (section === 'head') cell.styles.halign = colunas[column.index]?.halign ?? 'left';
            },
        });
        y = (doc as any).lastAutoTable.finalY + 3;
    };
    const colunasParametros = { 0: { cellWidth: 22, fontStyle: 'bold' }, 2: { cellWidth: 26, halign: 'right' }, 3: { cellWidth: 24 } };
    const parametros = (grupos: Grupo[]) => grupos.flatMap((g) => [
        [{ content: g.titulo, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [236, 245, 246] } }],
        ...g.linhas.map((l) => [l.rotulo, l.descricao, textoValor(l), l.unidade]),
    ]);

    escrever('ETA UFERSA · FACEU', 10, 'bold', VERDE);
    y += 1;
    escrever(`Relatório ${r.titulo}`, 18, 'bold', TEXTO);
    y += 1;
    escrever(r.descricao, 10, 'normal', CINZA);
    y += 1;
    escrever(`Gerado em ${textoGerado(gerado)}`, 9, 'normal', CINZA);
    y += 6;

    // caixa da conclusão, verde ou vermelha como na tela
    const cores = r.conclusao.atende
        ? { fundo: [236, 253, 245], borda: [110, 231, 183], titulo: [4, 120, 87] }
        : { fundo: [254, 242, 242], borda: [252, 165, 165], titulo: [185, 28, 28] };
    doc.setFont('Inter', 'bold').setFontSize(11);
    const linhasTitulo = doc.splitTextToSize(r.conclusao.titulo, largura - 8);
    const alturaTitulo = doc.getTextDimensions(linhasTitulo).h;
    doc.setFont('Inter', 'normal').setFontSize(9.5);
    const linhasCorpo = r.conclusao.linhas.flatMap((l) => doc.splitTextToSize(l, largura - 8));
    const alturaCorpo = linhasCorpo.length ? doc.getTextDimensions(linhasCorpo as unknown as string).h + 1.5 : 0;
    doc.setFillColor(cores.fundo[0], cores.fundo[1], cores.fundo[2]).setDrawColor(cores.borda[0], cores.borda[1], cores.borda[2]).setLineWidth(0.3);
    doc.roundedRect(MARGEM, y, largura, alturaTitulo + alturaCorpo + 8, 1.5, 1.5, 'FD');
    doc.setFont('Inter', 'bold').setFontSize(11).setTextColor(cores.titulo[0], cores.titulo[1], cores.titulo[2]);
    doc.text(linhasTitulo, MARGEM + 4, y + 4, { baseline: 'top' });
    if (linhasCorpo.length) {
        doc.setFont('Inter', 'normal').setFontSize(9.5).setTextColor(...TEXTO);
        doc.text(linhasCorpo, MARGEM + 4, y + 4 + alturaTitulo + 1.5, { baseline: 'top' });
    }
    y += alturaTitulo + alturaCorpo + 11;

    secao('Valores fornecidos');
    tabela(['Parâmetro', 'Descrição', 'Valor', 'Unidade'], parametros(r.fornecidos), colunasParametros);

    secao('Valores calculados');
    tabela(['Parâmetro', 'Descrição', 'Valor', 'Unidade'], parametros(r.calculados), colunasParametros);

    r.tabelas.forEach((t) => {
        secao(t.titulo, 8 + t.linhas.length * 7.2);
        tabela(t.colunas, t.linhas.map((l) => l.map((v, i) => celulaTabela(t, v, i))),
            Object.fromEntries(t.colunas.map((_, i) => [i, { halign: i === 0 ? 'left' : 'right' }])));
    });

    if (r.verificacoes.length) {
        secao('Verificações', 8 + r.verificacoes.length * 7.2);
        tabela(['Situação', 'Critério', 'Referência'],
            r.verificacoes.map((v) => [
                { content: v.ok ? '✓ Atende' : '✗ Não atende', styles: { textColor: v.ok ? [4, 120, 87] : [185, 28, 28], fontStyle: 'bold' } },
                v.texto,
                v.detalhe ?? '',
            ]),
            { 0: { cellWidth: 26 }, 1: { cellWidth: 70 } });
    }

    if (r.desenho) {
        const altura = largura * r.desenho.altura / r.desenho.largura;
        secao('Desenho', altura);
        doc.addImage(r.desenho.imagem, 'PNG', MARGEM, y, largura, altura, undefined, 'FAST');
        y += altura + 3;
    }

    const paginas = doc.getNumberOfPages();
    for (let p = 1; p <= paginas; p++) {
        doc.setPage(p);
        doc.setFont('Inter', 'normal').setFontSize(8).setTextColor(...CINZA);
        doc.text(`ETA UFERSA · ${r.titulo} · pré-dimensionamento para fins didáticos`, MARGEM, alturaPagina - 9);
        doc.text(`Página ${p} de ${paginas}`, larguraPagina - MARGEM, alturaPagina - 9, { align: 'right' });
    }
    return doc.output('blob');
}
