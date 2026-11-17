import jsPDF from 'jspdf';
import { EntradaFloc, ResultadoFloc } from './calculo';

const COLUNAS: Array<[string, number]> = [['n', 87], ['e', 117], ['V1 (m/s)', 155], ['V2 (m/s)', 215], ['Dhd (m)', 274], ['Dhl (m)', 331], ['Dht (m)', 387], ['G (1/s)', 440]];
const X_VALORES = [84, 105, 160, 220, 275, 333, 388, 438];
const X_LINHAS = [80, 100, 148, 208, 266, 322, 381, 433, 485];

// Relatório em PDF da floculação (mesmo conteúdo da versão anterior)
export function relatorioFloculacao(e: EntradaFloc, r: ResultadoFloc, fator: number | null, desenho: HTMLCanvasElement | null) {
    const doc = new jsPDF('p', 'pt');
    const cabecalho = () => {
        doc.setFont('courier');
        doc.setFontSize(10);
        doc.text('Universidade Federal Rural do Semi-Árido - UFERSA', 80, 50);
        doc.text('Este programa é destinado à realização do pré-dimensionamento da', 80, 63);
        doc.text('unidade de floculação hidráulica (fluxo vertical) em estações do', 80, 76);
        doc.text('tratamento de água do tipo convencional', 80, 89);
        doc.setLineWidth(0.5);
        doc.line(485, 95, 80, 95);
    };
    const tabela = (M: number[][], topo: number) => {
        doc.line(485, topo, 80, topo);
        COLUNAS.forEach(([t, x]) => doc.text(t, x, topo + 12));
        for (let i = 0; i < e.nc; i++) {
            const y = topo + 30 + 15 * i;
            M.forEach((col, k) => doc.text(col[i].toFixed(k === 0 ? 0 : 4), X_VALORES[k], y));
        }
        const linha = topo + 30 + 15 * e.nc - 5;
        X_LINHAS.forEach((x) => doc.line(x, topo, x, linha));
        doc.line(485, linha, 80, linha);
        return linha;
    };

    cabecalho();
    doc.text('Dados de entrada', 80, 115);
    doc.text(`Vazão (m³/s): ${e.q}`, 100, 128);
    doc.text(`Tempo (min): ${e.t}`, 260, 128);
    doc.text(`Nº de câmaras: ${e.nc}`, 380, 128);
    doc.text(`Profundidade (m): ${e.prof}`, 100, 141);
    doc.text(`Nº de unidades: ${e.nd}`, 260, 141);
    doc.text(`Largura (m): ${e.l}`, 380, 141);
    let linha = 160;
    e.G.slice(0, e.nc).forEach((g, i) => {
        linha += 13;
        doc.text(`G da câmara ${i + 1} (1/s) = ${g}`, 100, linha);
    });

    doc.line(485, 255, 80, 255);
    doc.text('Relatório analítico da unidade de Floculação', 80, 275);
    doc.text(`Vazão por unidade (m³/s) = ${r.q.toFixed(4)}`, 100, 308);
    doc.text(`Volume de água (m³) = ${r.vol.toFixed(0)}`, 100, 321);
    doc.text(`Área superficial do floculador (m²) = ${r.area.toFixed(4)}`, 100, 334);
    doc.text(`B = A / largura (m) = ${r.B.toFixed(4)}`, 100, 347);
    doc.text(`a = B / nº de câmaras (m) = ${r.a.toFixed(4)}`, 100, 360);

    let fim = tabela(r.original, 395);
    if (r.corrigida && fator) {
        doc.text(`Câmara(s) com G acima de 70 1/s; usando um fator de correção de ${fator}%,`, 80, fim + 25);
        doc.text('tem-se:', 80, fim + 38);
        fim = tabela(r.corrigida, fim + 50);
    }
    const legenda = ['n = Número de espaçamentos entre chicanas em cada câmara', 'e = Espaçamento entre chicanas (m)', 'V1 = Velocidade nos trechos retos', 'V2 = Velocidade nos trechos curvos', 'Dhd = Perda de carga distribuída', 'Dhl = Perda de carga localizada', 'Dht = Perda de carga total', 'G = Gradiente de velocidade'];
    doc.text('Legenda: ', 80, fim + 30);
    legenda.forEach((l, i) => doc.text(l, 80, fim + 43 + 13 * i));

    if (desenho) {
        doc.addPage();
        cabecalho();
        doc.text('Detalhamento do pré-dimensionamento da unidade de Floculação', 80, 115);
        doc.addImage(desenho.toDataURL(), 'PNG', 15, 130, 580, 420);
    }
    doc.output('dataurlnewwindow');
}
