import React, { useState } from 'react';
import { Erro } from '../../Utils/validacao';
import { MensagemErro } from './estilos';

// Erros da tela: o destaque some do campo assim que ele é editado; a mensagem some
// quando todos os campos dela foram editados
export default function useErros() {
    const [erros, setErros] = useState<Erro[]>([]);
    return {
        erros,
        definir: setErros,
        invalido: (campo: string) => erros.some((e) => e.campos.includes(campo)),
        editado: (campo: string) => setErros((atual) => atual
            .map((e) => ({ ...e, campos: e.campos.filter((c) => c !== campo) }))
            .filter((e) => e.campos.length > 0)),
    };
}

export function ListaErros({ erros }: { erros: Erro[] }) {
    if (!erros.length) return null;
    return (
        <MensagemErro role="alert">
            {erros.map((e) => <div key={e.mensagem}>{e.mensagem}</div>)}
        </MensagemErro>
    );
}
