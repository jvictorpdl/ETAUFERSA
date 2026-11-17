import jsPDF from 'jspdf';

// Relatório em PDF da coagulação (mesmo conteúdo da versão anterior)
export function relatorioCoagulacao(q: number, v: number[], V: number[], H: number[], O: number[], desenho: HTMLCanvasElement | null) {
    const doc = new jsPDF('p', 'pt');
    const cabecalho = () => {
        doc.setFont('courier');
        doc.setFontSize(10);
        doc.text('Universidade Federal Rural do Semi-Árido - UFERSA', 80, 50);
        doc.text('Este programa é destinado à realização do pré-dimensionamento da', 80, 63);
        doc.text('unidade de coagulação (hidráulica) em estações de tratamento', 80, 76);
        doc.text('de água do tipo convencional', 80, 89);
        doc.setLineWidth(0.5);
        doc.line(485, 95, 80, 95);
    };
    cabecalho();
    doc.text('Dados de entrada', 80, 115);
    doc.text('Medidor Parshall (W, k, n, N, D, K, G\', C): ', 80, 138);
    v.forEach((e, i) => doc.text(e.toFixed(4), 80 + 50 * i, 151));
    doc.text('Vazão no canal de coagulação (m³/s)', 80, 174);
    doc.text(`${q}`, 80, 187);

    doc.text('Relatório analítico da unidade de Coagulação', 80, 225);
    doc.text('Velocidades obtidas (m/s)', 80, 248);
    doc.text(`Velocidade na seção de medição = ${V[0].toFixed(4)}`, 100, 261);
    doc.text(`Velocidade antes do ressalto = ${V[1].toFixed(4)}`, 100, 274);
    doc.text(`Velocidade no ressalto = ${V[2].toFixed(4)}`, 100, 287);
    doc.text(`Velocidade na seção de saída do Parshall = ${V[3].toFixed(4)}`, 100, 300);

    doc.text('Alturas obtidas (m)', 80, 330);
    doc.text(`Altura de água na seção de medição = ${H[0].toFixed(4)}`, 100, 353);
    doc.text(`Altura de água antes do ressalto = ${H[1].toFixed(4)}`, 100, 366);
    doc.text(`Altura do ressalto = ${H[2].toFixed(4)}`, 100, 379);
    doc.text(`Altura na seção de saída = ${H[3].toFixed(4)}`, 100, 392);

    doc.text(`Largura do Parshall na seção de medição = ${O[0].toFixed(4)}`, 100, 430);
    doc.text(`Vazão específica na garganta do Parshall = ${O[1].toFixed(4)}`, 100, 443);
    doc.text(`Carga hidráulica disponível = ${O[2].toFixed(4)}`, 100, 456);
    doc.text(`Número de Froude = ${O[3].toFixed(4)}`, 100, 469);
    doc.text(`Perda de carga no ressalto = ${O[4].toFixed(4)}`, 100, 482);

    doc.text('Tempo de mistura (s)', 80, 520);
    doc.text(`T = ${O[5].toFixed(4)}`, 100, 533);
    doc.text('Gradiente de velocidade (s-1)', 80, 546);
    doc.text(`G = ${O[6].toFixed(4)}`, 100, 569);

    if (desenho) {
        doc.addPage();
        cabecalho();
        doc.text('Detalhamento do pré-dimensionamento da unidade de Coagulação', 80, 115);
        doc.addImage(desenho.toDataURL(), 'PNG', 15, 130, 550, 350);
    }
    doc.output('dataurlnewwindow');
}
