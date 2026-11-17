import React, { forwardRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { cores } from './estilos';

const Moldura = styled.figure`
    margin-bottom: 16px;
    padding: 8px;
    border: 1px solid ${cores.bordaSuave};
    border-radius: 8px;
    background: #FFF;
    text-align: center;

    canvas {
        display: block;
        width: 100%;
        max-width: ${(p: { $largura: number }) => p.$largura}px;
        height: auto;
        margin: 0 auto;
    }
`;

interface Props {
    imagem: string;
    largura: number;
    altura: number;
    titulo: string;
    desenhar: (ctx: CanvasRenderingContext2D) => void;
}

// Desenho da unidade: a figura de fundo com as medidas calculadas escritas por cima.
// O canvas fica no tamanho original (para o PDF e o PNG) e encolhe só na tela.
const Desenho = forwardRef<HTMLCanvasElement, Props>(({ imagem, largura, altura, titulo, desenhar }, ref) => {
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const i = new Image();
        i.onload = () => setImg(i);
        i.src = imagem;
    }, [imagem]);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!img || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, largura, altura);
        ctx.drawImage(img, 0, 0, largura, altura);
        ctx.fillStyle = '#000';
        desenhar(ctx);
    });

    return (
        <Moldura $largura={largura}>
            <canvas ref={ref} width={largura} height={altura} role="img" aria-label={titulo} />
        </Moldura>
    );
});

export default Desenho;

export function baixarPng(canvas: HTMLCanvasElement | null, nome: string) {
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
}
