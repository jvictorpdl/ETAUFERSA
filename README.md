# ETA UFERSA

Pré-dimensionamento das unidades de uma estação de tratamento de água (ETA) do tipo
convencional:

- **Coagulação**: calha Parshall como misturador rápido (ressalto hidráulico, tempo de
  mistura e gradiente de velocidade)
- **Floculação**: floculador hidráulico de chicanas verticais com 3, 4 ou 5 câmaras,
  com correção das câmaras cujo G passa de 70 s⁻¹
- **Decantação**: decantador convencional de escoamento horizontal
- **Filtração**: filtro rápido de dupla camada (areia e antracito)

Cada tela gera um relatório em PDF e um desenho com as dimensões.

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

Os testes ficam em `src/Utils/__tests__/` e conferem os cálculos com:

- consistência física (soma dos tempos das câmaras, conservação de energia no ressalto,
  continuidade, dimensões coerentes);
- oráculos independentes: equações de descarga livre da calha Parshall (ASTM D1941 /
  ISO 9826) e a equação de Wen & Yu (1966) para a velocidade mínima de fluidificação.

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
  projeto usa TypeScript 4.
- Os cálculos estão em `src/Utils/` (`Coag.ts`, `Floc*.ts`, `Dec.ts`, `Filtr.ts`); as
  telas, em `src/pages/`.
