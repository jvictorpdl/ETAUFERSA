import React, { useState } from 'react';
import { nomeArquivo, Relatorio, relatorioCsv } from '../../relatorio/modelo';
import { Bloco, Botoes, BotaoSecundario, cores, TituloBloco } from './estilos';

interface Formato {
    rotulo: string;
    extensao: string;
    parte?: string;
    gerar: (r: Relatorio, gerado: Date) => Promise<Blob>;
}

// cada biblioteca só é baixada quando alguém escolhe o formato
const FORMATOS: Formato[] = [
    { rotulo: 'PDF', extensao: 'pdf', gerar: async (r, g) => (await import('../../relatorio/pdf')).gerarPdf(r, g) },
    { rotulo: 'Word', extensao: 'docx', gerar: async (r, g) => (await import('../../relatorio/word')).gerarWord(r, g) },
    { rotulo: 'Excel', extensao: 'xlsx', gerar: async (r, g) => (await import('../../relatorio/excel')).gerarExcel(r, g) },
    { rotulo: 'CSV', extensao: 'csv', gerar: async (r, g) => new Blob([relatorioCsv(r, g)], { type: 'text/csv;charset=utf-8' }) },
    {
        rotulo: 'Desenho (PNG)',
        extensao: 'png',
        parte: '-desenho',
        gerar: async (r) => (await fetch(r.desenho!.imagem)).blob(),
    },
];

function salvar(blob: Blob, nome: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // o Safari do iPhone ainda lê o endereço depois do clique
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// O relatório é montado na hora do clique, para levar o desenho já pronto
export default function BaixarRelatorio({ montar }: { montar: () => Relatorio }) {
    const [gerando, setGerando] = useState<string | null>(null);
    const [falhou, setFalhou] = useState(false);

    async function baixar(f: Formato) {
        setGerando(f.rotulo);
        setFalhou(false);
        try {
            const r = montar();
            if (f.extensao === 'png' && !r.desenho) throw new Error('desenho ainda não carregado');
            const gerado = new Date();
            salvar(await f.gerar(r, gerado), nomeArquivo(r, gerado, f.extensao, f.parte));
        } catch (erro) {
            console.error(erro);
            setFalhou(true);
        } finally {
            setGerando(null);
        }
    }

    return (
        <Bloco aria-label="Baixar relatório">
            <TituloBloco>Baixar relatório com os valores fornecidos e calculados</TituloBloco>
            <Botoes>
                {FORMATOS.map((f) => (
                    <BotaoSecundario key={f.rotulo} type="button" disabled={gerando !== null} onClick={() => baixar(f)}>
                        {gerando === f.rotulo ? 'Gerando…' : f.rotulo}
                    </BotaoSecundario>
                ))}
            </Botoes>
            {falhou && <p role="alert" style={{ marginTop: 8, color: cores.erro, fontSize: 14 }}>Não foi possível gerar o arquivo. Tente de novo.</p>}
        </Bloco>
    );
}
