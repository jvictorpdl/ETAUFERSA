# ETA UFERSA

Pré-dimensionamento das unidades de uma estação de tratamento de água (ETA) do tipo
convencional:

- **Coagulação**: calha Parshall como misturador rápido (ressalto hidráulico, tempo de
  mistura e gradiente de velocidade)
- **Floculação**: floculador hidráulico de chicanas verticais com 3, 4 ou 5 câmaras,
  com correção das câmaras cujo G passa de 70 s⁻¹
- **Decantação**: decantador convencional de escoamento horizontal
- **Filtração**: filtro rápido de dupla camada (areia e antracito)

O visual segue o padrão das ferramentas da FACEU (o mesmo do Calimpe-H20). Em cada
unidade:

- os campos têm a unidade dentro da caixa e uma dica (ⓘ); entradas fora de faixa
  plausível são recusadas com uma mensagem que diz o limite;
- "Usar exemplo" preenche um caso didático quando o formulário está vazio;
- os resultados trazem a conclusão, as verificações da NBR 12216 (itens 5.8, 5.9,
  5.10 e 5.12) e o desenho com as dimensões;
- o relatório com todos os valores fornecidos e calculados sai em PDF, Word, Excel ou
  CSV, e o desenho em PNG;
- os valores digitados ficam guardados no navegador ("Limpar dados" apaga).

## Rodar no computador

Requer Node 18 ou mais novo.

```bash
npm ci
npm start
```

A aplicação abre em http://localhost:3000.

## Testes

```bash
CI=true npx react-scripts test --watchAll=false
```

Os testes conferem:

- **cálculos** (`src/Utils/__tests__/`): consistência física (soma dos tempos das
  câmaras, conservação de energia no ressalto, continuidade, dimensões coerentes) e
  oráculos independentes (equações de descarga livre da calha Parshall da ASTM D1941 /
  ISO 9826 e equação de Wen & Yu, 1966);
- **validação e robustez**: faixas de cada campo e 500 combinações plausíveis da
  Filtração sem NaN, infinito ou valor negativo;
- **verificações da NBR 12216** e formato dos números;
- **relatório** (`src/relatorio/`): nome do arquivo e conteúdo do CSV;
- **telas** (`src/pages/__tests__/`): de "Usar exemplo" até a conclusão em cada
  unidade, erros de preenchimento e correção do G na Floculação.

## Publicar

```bash
CI=true npm run build
```

Com `CI=true` qualquer aviso do ESLint vira erro, como na Netlify. A pasta `build/` é a
que vai ao ar; `netlify.toml` e `public/_redirects` já configuram a Netlify.

## Observações técnicas

- O projeto usa Create React App 4 (webpack 4). Os scripts `start` e `build` passam
  `--openssl-legacy-provider` ao Node, necessário a partir do Node 17.
- `.npmrc` liga `legacy-peer-deps`, porque o react-scripts 4 declara TypeScript 3 e o
  projeto usa TypeScript 4.9. O `@types/node` fica fixado na versão 14 (`overrides`),
  porque o docx traz tipos mais novos que esse TypeScript não lê.
- A fonte do PDF é um subconjunto da Inter (licença OFL, em `src/assets/fontes`) com
  s⁻¹, subscritos, Δ e letras gregas; se o relatório ganhar um caractere fora dela,
  é preciso regerar o subconjunto.
- As bibliotecas de PDF, Word e Excel só são baixadas quando alguém escolhe o formato.
- Os cálculos estão em `src/Utils/` (`Coag.ts`, `Floc*.ts`, `Dec.ts`, `Filtr.ts`), com
  as verificações em `criterios.ts` e a validação em `validacao.ts`; as telas, em
  `src/pages/`; os componentes visuais comuns, em `src/components/ui/`.
