import jsPDF from 'jspdf';
import { EntradaFiltr, ResultadoFiltr } from './calculo';

// Relatório em PDF da filtração (mesmo conteúdo da versão anterior)
export function relatorioFiltracao(e: EntradaFiltr, r: ResultadoFiltr, desenho: HTMLCanvasElement | null) {
    const doc = new jsPDF('p', 'pt');
    const cabecalho = () => {
        doc.setFont('courier');
        doc.setFontSize(10);
        doc.text('Universidade Federal Rural do Semi-Árido - UFERSA', 80, 50);
        doc.text('Este programa é destinado à realização do pré-dimensionamento da', 80, 63);
        doc.text('unidade de filtração rápida (camada dupla de antracito e areia)', 80, 76);
        doc.text('em estações do tratamento de água do tipo convencional', 80, 89);
        doc.setLineWidth(0.5);
        doc.line(485, 95, 80, 95);
    };
    const f4 = (x: number) => x.toFixed(4);
    cabecalho();
    doc.text('Dados de entrada', 80, 128);
    doc.text(`Vazão (m³/s) = ${e.q}`, 100, 148);
    doc.text(`Taxa de filtração (m³/m²dia) = ${e.taxa}`, 100, 161);
    doc.text(`Número de decantadores = ${e.nd}`, 100, 173);
    doc.text(`Largura do decantador (m) = ${e.ldec}`, 100, 186);
    doc.text(`Largura da calha de lavagem (m) = ${e.lcalha}`, 100, 199);
    doc.text(`Número de calhas = ${e.ncalhas}`, 100, 211);
    doc.text(`Vazão de ar q (l/s/m²) = ${e.ar}`, 100, 224);
    doc.text('Camada suporte: ', 340, 128);
    doc.text(`Altura (m) = ${e.suporte.altura}`, 360, 148);
    doc.text(`Porosidade = ${e.suporte.porosidade}`, 360, 161);
    doc.text(`C. esfericidade = ${e.suporte.esfericidade}`, 360, 173);
    doc.text(`d10 (mm) = ${e.suporte.d10}`, 360, 186);
    doc.text(`d90 (mm) = ${e.suporte.d90}`, 360, 199);

    ([['Areia: ', e.areia, 80], ['Antracito: ', e.antracito, 340]] as const).forEach(([nome, m, x]) => {
        doc.text(nome, x, 260);
        doc.text(`Altura (m) = ${m.altura}`, x + 20, 273);
        doc.text(`Def (mm) = ${m.def}`, x + 20, 286);
        doc.text(`C.U = ${m.cu}`, x + 20, 299);
        doc.text(`Massa específica (kg/m³) = ${m.massa}`, x + 20, 312);
        doc.text(`Porosidade = ${m.porosidade}`, x + 20, 325);
        doc.text(`C. esfericidade = ${m.esfericidade}`, x + 20, 338);
        doc.text(`d10 (mm) = ${m.d10}`, x + 20, 351);
    });

    doc.text('Relatório analítico da unidade de Filtração', 80, 371);
    doc.text('Dimensões dos filtros', 80, 391);
    doc.text(`Área total de filtração (m²) = ${f4(r.filtros.areaTotal)}`, 100, 406);
    doc.text(`Número de filtros = ${r.filtros.numero}`, 100, 419);
    doc.text(`Área de cada filtro (m²) = ${f4(r.filtros.area)}`, 100, 432);
    doc.text(`Dimensões do filtro L (m) = ${f4(r.filtros.L)}`, 100, 445);
    doc.text(`Dimensões do filtro Y (m) = ${f4(r.filtros.Y)}`, 100, 458);

    doc.text('Lavagem de filtros / Lâmina mínima de água sobre o leito filtrante', 80, 483);
    doc.text(`Vazão de água de lavagem (m³/s) = ${f4(r.lavagem.vazao)}`, 100, 498);
    doc.text(`Volume de lavagem (m³) = ${f4(r.lavagem.volume)}`, 100, 511);
    doc.text(`Volume de reservação (m³) = ${f4(r.lavagem.reservacao)}`, 100, 524);
    doc.text(`Tubulação de água de lavagem (mm) = ${r.lavagem.tubulacao}`, 100, 537);
    doc.text(`Vazão de ar (L/s) = ${f4(r.lavagem.ar)}`, 100, 550);
    doc.text(`Lâmina da água (m) = ${f4(r.lavagem.lamina)}`, 100, 563);

    doc.text('Calhas de água de lavagem', 80, 588);
    doc.text(`Dimensões de calha B (m) = ${f4(r.calhas.B)}`, 100, 603);
    doc.text(`Dimensões de calha h (m) = ${f4(r.calhas.h0)}`, 100, 616);
    doc.text(`Consideração = ${f4(r.calhas.hMin)} - H0 - ${f4(r.calhas.hMax)}`, 100, 629);
    doc.text(`Consideração = ${f4(r.calhas.sMin)} - S - ${f4(r.calhas.sMax)}`, 100, 642);
    doc.text(`S entre calhas (m) = ${f4(r.calhas.S)}`, 100, 655);

    doc.text('Perdas de carga (m)', 80, 680);
    doc.text(`Areia = ${f4(r.perdas.areia)}`, 100, 695);
    doc.text(`Antracito = ${f4(r.perdas.antracito)}`, 100, 708);
    doc.text(`Total = ${f4(r.perdas.total)}`, 100, 721);
    doc.text(`Camada suporte = ${f4(r.perdas.suporte)}`, 100, 734);

    doc.text('Velocidade mínima de fluidificação (m/s)', 80, 756);
    doc.text(`Areia = ${f4(r.vmf.areia)}`, 100, 771);
    doc.text(`Antracito = ${f4(r.vmf.antracito)}`, 100, 784);
    doc.text(`Bifásico = ${f4(r.vmf.misto)}`, 100, 797);

    if (desenho) {
        doc.addPage();
        cabecalho();
        doc.text('Detalhamento do pré-dimensionamento da unidade de Filtração', 80, 115);
        doc.addImage(desenho.toDataURL(), 'PNG', 15, 130, 580, 400);
    }
    doc.output('dataurlnewwindow');
}
