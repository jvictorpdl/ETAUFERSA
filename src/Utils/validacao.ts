// Validação das entradas: cada campo tem uma faixa plausível e a mensagem diz qual é.
// Devolve { mensagem, campos } para a tela destacar os campos e explicar o problema.
import { lerNumero, numero } from '../components/ui/formato';

export interface Erro {
    mensagem: string;
    campos: string[];
}

export interface Regra {
    campo: string;
    nome: string; // como aparece na mensagem: "a porosidade da areia"
    min?: number; // exclusivo, a não ser que minIgual
    minIgual?: boolean;
    max?: number; // exclusivo, a não ser que maxIgual
    maxIgual?: boolean;
    inteiro?: boolean;
}

const fmt = (x: number) => numero(x, Number.isInteger(x) ? 0 : 2);

function faixa(r: Regra): string {
    const tipo = r.inteiro ? 'um número inteiro' : 'um número';
    const min = r.min ?? 0;
    const de = r.minIgual ? `de pelo menos ${fmt(min)}` : `maior que ${fmt(min)}`;
    if (r.max === undefined) return `${tipo} ${de}`;
    if (r.minIgual && r.maxIgual) return `${tipo} de ${fmt(min)} a ${fmt(r.max)}`;
    const ate = r.maxIgual ? `até ${fmt(r.max)}` : `menor que ${fmt(r.max)}`;
    return `${tipo} ${de} e ${ate}`;
}

export function validarCampos(dados: Record<string, string>, regras: Regra[]): Erro[] {
    const vazios: string[] = [];
    const erros: Erro[] = [];
    regras.forEach((r) => {
        const texto = dados[r.campo] ?? '';
        if (texto.trim() === '') {
            vazios.push(r.campo);
            return;
        }
        const x = lerNumero(texto);
        const min = r.min ?? 0;
        const abaixo = r.minIgual ? x < min : x <= min;
        const acima = r.max !== undefined && (r.maxIgual ? x > r.max : x >= r.max);
        if (!Number.isFinite(x) || abaixo || acima || (r.inteiro && !Number.isInteger(x))) {
            erros.push({ mensagem: `Informe para ${r.nome} ${faixa(r)}.`, campos: [r.campo] });
        }
    });
    if (vazios.length) erros.unshift({ mensagem: 'Preencha os campos destacados.', campos: vazios });
    return erros;
}

// ---------- regras de cada unidade ----------

export const REGRAS_DECANTACAO: Regra[] = [
    { campo: 'q', nome: 'a vazão Q' },
    { campo: 'vs', nome: 'a taxa de aplicação vs' },
    { campo: 'ns', nome: 'o número de unidades', min: 1, minIgual: true, inteiro: true },
    { campo: 'prof', nome: 'a profundidade H' },
];

export const REGRAS_FLOCULACAO_DADOS: Regra[] = [
    { campo: 'q', nome: 'a vazão Q' },
    { campo: 't', nome: 'o tempo de floculação' },
    { campo: 'prof', nome: 'a profundidade H' },
    { campo: 'nd', nome: 'o número de unidades', min: 1, minIgual: true, inteiro: true },
    { campo: 'l', nome: 'a largura' },
];

export const regrasGradientes = (nc: number): Regra[] =>
    Array.from({ length: nc }, (_, i) => ({ campo: `g${i + 1}`, nome: `o G da câmara ${i + 1}` }));

const meio = (g: string, nome: string): Regra[] => [
    { campo: `${g}.altura`, nome: `a espessura ${nome}` },
    { campo: `${g}.def`, nome: `o tamanho efetivo ${nome}` },
    { campo: `${g}.cu`, nome: `o coeficiente de uniformidade ${nome}`, min: 1, minIgual: true },
    // mais leve que a água, o grão não sedimenta e a velocidade de fluidificação sai negativa
    { campo: `${g}.massa`, nome: `a massa específica ${nome} (kg/m³; mais densa que a água)`, min: 1000 },
    { campo: `${g}.porosidade`, nome: `a porosidade ${nome}`, max: 1 },
    { campo: `${g}.esfericidade`, nome: `o coeficiente de esfericidade ${nome}`, max: 1, maxIgual: true },
    { campo: `${g}.d10`, nome: `o d10 ${nome}` },
];

export const REGRAS_FILTRACAO: Record<string, Regra[]> = {
    'Dados gerais': [
        { campo: 'geral.q', nome: 'a vazão Q' },
        { campo: 'geral.taxa', nome: 'a taxa de filtração' },
        { campo: 'geral.nd', nome: 'o número de decantadores', min: 1, minIgual: true, inteiro: true },
        { campo: 'geral.ldec', nome: 'a largura do decantador' },
        { campo: 'geral.lcalha', nome: 'a largura da calha de lavagem' },
        // com uma calha só, o espaçamento entre calhas fica sem sentido (divisão por zero)
        { campo: 'geral.ncalhas', nome: 'o número de calhas', min: 2, minIgual: true, inteiro: true },
        { campo: 'geral.ar', nome: 'a taxa de ar (0 se a lavagem não usa ar)', minIgual: true },
    ],
    'Meio filtrante': [...meio('areia', 'da areia'), ...meio('antracito', 'do antracito')],
    'Camada suporte': [
        { campo: 'suporte.altura', nome: 'a espessura da camada suporte' },
        { campo: 'suporte.porosidade', nome: 'a porosidade da camada suporte', max: 1 },
        { campo: 'suporte.esfericidade', nome: 'o coeficiente de esfericidade da camada suporte', max: 1, maxIgual: true },
        { campo: 'suporte.d10', nome: 'o d10 da camada suporte' },
        { campo: 'suporte.d90', nome: 'o d90 da camada suporte' },
    ],
};

// Regras que dependem de mais de um campo
export function validarFiltracao(dados: Record<string, string>, grupo: string): Erro[] {
    const erros = validarCampos(dados, REGRAS_FILTRACAO[grupo] ?? []);
    if (erros.length) return erros;
    const n = (k: string) => lerNumero(dados[k]);
    if (grupo === 'Dados gerais' && n('geral.lcalha') >= n('geral.ldec') / 2) {
        erros.push({
            mensagem: `A largura da calha de lavagem precisa ser menor que metade da largura do decantador (${fmt(n('geral.ldec') / 2)} m): os filtros ficam lado a lado e a calha ocupa parte de cada um.`,
            campos: ['geral.lcalha', 'geral.ldec'],
        });
    }
    if (grupo === 'Camada suporte' && n('suporte.d90') <= n('suporte.d10')) {
        erros.push({ mensagem: 'O d90 da camada suporte precisa ser maior que o d10.', campos: ['suporte.d10', 'suporte.d90'] });
    }
    return erros;
}
