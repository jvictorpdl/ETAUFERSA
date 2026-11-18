import writeXlsxFile from 'write-excel-file';
import { Grupo, Relatorio, textoGerado } from './modelo';

const VERDE = '#17737A';
const negrito = (value: string, extra: object = {}) => ({ value, fontWeight: 'bold', ...extra });
const cabecalho = (value: string) => ({ value, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: VERDE });
const CAB = ['Parâmetro', 'Descrição', 'Valor', 'Unidade'].map(cabecalho);

// os valores vão como número, para a planilha aceitar fórmulas e gráficos
const parametros = (grupos: Grupo[]) => grupos.flatMap((g) => [
    [negrito(g.titulo, { backgroundColor: '#ECF5F6', span: 4 }), null, null, null],
    ...g.linhas.map((l) => [negrito(l.rotulo), { value: l.descricao }, { value: l.valor, type: Number }, { value: l.unidade }]),
]);

export async function gerarExcel(r: Relatorio, gerado: Date): Promise<Blob> {
    const texto = (value: string) => [{ value }];
    const principal: any[] = [
        [negrito(`Relatório ${r.titulo}`, { fontSize: 14 })],
        texto(r.descricao),
        texto(`Gerado em ${textoGerado(gerado)}`),
        [],
        [negrito('Conclusão')],
        texto(r.conclusao.titulo),
        ...r.conclusao.linhas.map(texto),
        [],
        [negrito('Valores fornecidos')],
        CAB,
        ...parametros(r.fornecidos),
        [],
        [negrito('Valores calculados')],
        CAB,
        ...parametros(r.calculados),
        ...(r.verificacoes.length ? [
            [],
            [negrito('Verificações')],
            ['Situação', 'Critério', 'Referência'].map(cabecalho).concat([null as any]),
            ...r.verificacoes.map((v) => [negrito(v.ok ? 'Atende' : 'Não atende', { color: v.ok ? '#047857' : '#B91C1C' }), { value: v.texto }, { value: v.detalhe ?? '' }, null]),
        ] : []),
    ];
    const dados: any[] = [principal];
    const colunas: any[] = [[{ width: 16 }, { width: 60 }, { width: 18 }, { width: 14 }]];
    const nomes = ['Relatório'];
    r.tabelas.forEach((t, i) => {
        dados.push([
            t.colunas.map(cabecalho),
            ...t.linhas.map((l) => l.map((v) => (typeof v === 'number' ? { value: v, type: Number } : { value: v }))),
        ]);
        colunas.push(t.colunas.map(() => ({ width: 14 })));
        nomes.push(t.titulo.slice(0, 31) || `Tabela ${i + 1}`);
    });
    // linhas vazias viram null, como a biblioteca espera
    const limpar = (folha: any[]) => folha.map((linha) => (linha.length ? linha : [null]));
    const blob = await (writeXlsxFile as any)(dados.map(limpar), { sheets: nomes, columns: colunas });
    return blob as Blob;
}
