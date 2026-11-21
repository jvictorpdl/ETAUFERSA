import { useEffect, useState } from 'react';

// Os valores digitados ficam guardados neste navegador, como no Calimpe-H20
export default function useDados<T extends Record<string, string>>(chave: string, inicial: T) {
    const nome = `eta-ufersa:${chave}`;
    const [dados, setDados] = useState<T>(() => {
        try {
            const salvo = window.localStorage.getItem(nome);
            return salvo ? { ...inicial, ...JSON.parse(salvo) } : inicial;
        } catch {
            return inicial;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(nome, JSON.stringify(dados));
        } catch {
            // sem armazenamento (aba privada, por exemplo): segue sem guardar
        }
    }, [nome, dados]);

    const alterar = (campo: keyof T, valor: string) => setDados((d) => ({ ...d, [campo]: valor }));
    const limpar = () => setDados(inicial);
    const preencher = (valores: Partial<T>) => setDados({ ...inicial, ...valores });
    const temDados = Object.keys(inicial).some((k) => dados[k] !== inicial[k]);
    return { dados, alterar, limpar, preencher, temDados };
}
