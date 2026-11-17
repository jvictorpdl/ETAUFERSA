// Números no padrão brasileiro: vírgula decimal e ponto de milhar
export function numero(valor: number, casas = 2): string {
    if (!Number.isFinite(valor)) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

// Lê o que foi digitado: aceita vírgula ou ponto como separador decimal
export function lerNumero(texto: string | undefined): number {
    if (texto === undefined) return NaN;
    const limpo = texto.trim().replace(/\s/g, '').replace(',', '.');
    if (limpo === '' || !/^-?\d*\.?\d+$|^-?\d+\.?$/.test(limpo)) return NaN;
    return Number(limpo);
}
