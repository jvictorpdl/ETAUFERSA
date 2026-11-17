import jsPDF from 'jspdf';
import Dec from '../../Utils/Dec';

// Relatório em PDF da decantação (mesmo conteúdo da versão anterior)
export function relatorioDecantacao(q: number, vs: number, ns: number, prof: number, desenho: HTMLCanvasElement | null) {
    const [V1, V2, V3] = Dec.dec(q, vs, ns, prof);
    const nbr = Dec.criterios(q, vs, ns, V1[4]);
    const capacidadeTexto = nbr.capacidade.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    const doc = new jsPDF('p', 'pt');
    const cabecalho = () => {
        doc.setFont('courier');
        doc.setFontSize(10);
        doc.text('Universidade Federal Rural do Semi-Árido - UFERSA', 80, 50);
        doc.text('Este programa é destinado à realização do pré-dimensionamento da', 80, 63);
        doc.text('unidade de decantação (fluxo horizontal) em estações do', 80, 76);
        doc.text('tratamento de água do tipo convencional', 80, 89);
        doc.setLineWidth(0.5);
        doc.line(485, 95, 80, 95);
    };
    cabecalho();
    doc.text('Dados de entrada', 80, 115);
    doc.text(`Vazão (m³/s): ${q}`, 100, 128);
    doc.text(`Velocidade de sedimentação (m³/m²dia): ${vs}`, 100, 141);
    doc.text(`Número das unidades de sedimentação: ${ns}`, 100, 154);
    doc.text(`Profundidade (m): ${prof}`, 100, 167);

    doc.text('Relatório analítico da unidade de Decantação', 80, 190);
    doc.text(`Área superficial útil da zona de decantação (m²) = ${V1[0].toFixed(4)}`, 100, 208);
    doc.text(`Tempo de detenção (s) = ${V1[1].toFixed(4)}`, 100, 221);
    doc.text(`Largura do decantador (m) = ${V1[2].toFixed(0)}`, 100, 234);
    doc.text(`Comprimento do decantador (m) = ${V1[3].toFixed(4)}`, 100, 247);
    doc.text(`Velocidade horizontal (cm/s) = ${V1[4].toFixed(4)}`, 100, 260);
    doc.text(`Vazão por metro de vertedor (L/s·m) = ${V2[0].toFixed(4)}`, 100, 273);
    doc.text(`Comprimento do total do vertedor (m) = ${V2[1].toFixed(4)}`, 100, 286);
    doc.text(`Comprimento das calhas (m) = ${V2[2].toFixed(4)}`, 100, 299);
    doc.text(`Número de calhas = ${V2[3].toFixed(0)}`, 100, 311);
    doc.text(`Espaçamento entre calhas (m) = ${V2[4].toFixed(4)}`, 100, 323);

    doc.line(485, 350, 80, 350);
    doc.text('Número de Reynolds (Re)', 100, 380);
    doc.text(`${V3[0].toFixed(0)}`, 100, 393);
    doc.text('comprimento do decantador / largura do decantador', 100, 416);
    doc.text(`${V3[1].toFixed(4)}`, 100, 429);

    doc.line(485, 450, 80, 450);
    doc.text('Considerações', 80, 480);
    if (V3[0] < 20000) {
        doc.text('Condição satisfeita:', 100, 503);
        doc.text('Re menor que 20000', 100, 516);
    } else {
        doc.text('Condição não satisfeita:', 100, 503);
        doc.text('Re maior que 20000', 100, 516);
    }
    doc.text(`NBR 12216 (capacidade ${capacidadeTexto} m³/dia):`, 100, 534);
    doc.text(`Taxa ${nbr.taxa.valor} m³/m²dia, máx. ${nbr.taxa.maximo}: ${nbr.taxa.ok ? 'atendida' : 'não atendida'}`, 100, 547);
    doc.text(`V0 ${nbr.v0.valor.toFixed(2)} cm/s, máx. ${nbr.v0.maximo}: ${nbr.v0.ok ? 'atendida' : 'não atendida'}`, 100, 560);
    doc.text(`${nbr.unidades.valor} unidade(s), mín. ${nbr.unidades.minimo}: ${nbr.unidades.ok ? 'atendida' : 'não atendida'}`, 100, 573);
    doc.text(`L/B = ${V3[1].toFixed(2)} ${V3[1] >= 3 && V3[1] <= 4 ? '(entre 3 e 4: atendida)' : '(fora de 3 a 4: não atendida)'}`, 100, 590);

    if (desenho) {
        doc.addPage();
        cabecalho();
        doc.text('Detalhamento do pré-dimensionamento da unidade de Decantação', 80, 115);
        doc.addImage(desenho.toDataURL(), 'PNG', 15, 130, 600, 346);
    }
    doc.output('dataurlnewwindow');
}
