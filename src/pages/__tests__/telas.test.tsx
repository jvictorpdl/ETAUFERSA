import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../../App';

// as telas são testadas pelo caminho que o aluno faz: exemplo, dimensionar, conferir a conclusão
function abrir(caminho: string) {
  window.localStorage.clear();
  window.history.pushState({}, '', caminho);
  return render(<App />);
}

const clicar = (texto: string | RegExp) => fireEvent.click(screen.getByRole('button', { name: texto }));
const conclusao = () => screen.getByRole('status').textContent ?? '';

beforeAll(() => {
  // o jsdom não desenha em canvas; o desenho é ignorado nos testes
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('Telas', () => {
  test('Coagulação: exemplo atende à NBR 12216', () => {
    abrir('/coagulacao');
    clicar('Usar exemplo');
    clicar('Dimensionar');
    expect(conclusao()).toContain('A calha atende à NBR 12216');
    expect(screen.getByRole('list', { name: 'Verificações da NBR 12216' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Excel' })).toBeTruthy();
  });

  test('Coagulação: vazão fora da faixa da calha', () => {
    abrir('/coagulacao');
    fireEvent.change(screen.getByLabelText('Calha Parshall'), { target: { value: '0' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Q/ }), { target: { value: '0,5' } });
    clicar('Dimensionar');
    expect(screen.getByRole('alert').textContent).toContain('A calha W 7,6 cm mede vazões de 0,8 a 53,8 L/s');
  });

  test('Decantação: campos vazios são destacados', () => {
    abrir('/decantacao');
    clicar('Dimensionar');
    expect(screen.getByRole('alert').textContent).toContain('Preencha os campos destacados');
    expect(document.querySelectorAll('input[aria-invalid="true"]')).toHaveLength(4);
  });

  test('Decantação: exemplo atende aos critérios', () => {
    abrir('/decantacao');
    clicar('Usar exemplo');
    clicar('Dimensionar');
    expect(conclusao()).toContain('O decantador atende aos critérios verificados');
  });

  test('Floculação: exemplo em dois passos e correção do G', () => {
    abrir('/floculacao');
    clicar('Usar exemplo');
    clicar('Próximo');
    clicar('Dimensionar');
    expect(conclusao()).toMatch(/4 câmaras/);
    expect(screen.queryByText('Correção do gradiente')).toBeNull(); // nenhuma câmara passa de 70 no exemplo

    // G de 95 na primeira câmara pede a correção
    clicar('Gradientes');
    fireEvent.change(screen.getByRole('textbox', { name: /^G1/ }), { target: { value: '95' } });
    clicar('Dimensionar');
    expect(conclusao()).toContain('G acima de 70');
    fireEvent.change(screen.getByRole('textbox', { name: /^Fator de correção/ }), { target: { value: '30' } });
    clicar('Aplicar correção');
    expect(screen.getByText(/Câmaras, com fator de correção de 30,0 %/)).toBeTruthy();
  });

  test('Filtração: três passos, exemplo atende', () => {
    abrir('/filtracao');
    clicar('Usar exemplo');
    clicar('Próximo');
    clicar('Próximo');
    clicar('Dimensionar');
    expect(conclusao()).toContain('O filtro atende aos critérios verificados');
  });

  test('Filtração: uma calha só é recusada com mensagem específica', () => {
    abrir('/filtracao');
    clicar('Usar exemplo');
    fireEvent.change(screen.getByRole('textbox', { name: /^Nº de calhas/ }), { target: { value: '1' } });
    clicar('Próximo');
    expect(screen.getByRole('alert').textContent).toContain('o número de calhas um número inteiro de pelo menos 2');
  });

  test('Página inexistente', () => {
    abrir('/nao-existe');
    expect(screen.getByText('Página não encontrada')).toBeTruthy();
  });
});
