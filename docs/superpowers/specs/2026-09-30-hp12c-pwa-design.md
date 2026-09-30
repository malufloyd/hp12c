# HP 12C para iPhone — Especificação de design

Data: 2026-09-30
Status: aprovado no brainstorming, aguardando revisão do documento

## 1. Objetivo

Um app para o iPhone do usuário que seja uma HP 12C fiel, com a aparência da **12C Gold** e as funções da **12C Platinum**. É para uso pessoal, então nome, logo e visual podem ser idênticos aos originais.

Para contar como sucesso:
- Os ~40 exemplos do manual da Platinum (`docs/reference/platinum-reference.md`, seção 5) produzem exatamente o display esperado.
- O app é instalado uma vez pelo Safari ("Adicionar à Tela de Início"), fica instalado para sempre, abre em tela cheia e funciona offline.
- Visualmente, o app é reconhecível como uma 12C Gold, com as legendas da Platinum.

## 2. Decisões tomadas

| Tema | Decisão | Motivo |
|---|---|---|
| Plataforma | PWA (HTML/CSS/JS), sem app nativo | Não há Xcode instalado. O app nativo expiraria em 7 dias sem conta paga, e o PWA não expira. |
| Hospedagem | GitHub Pages, repositório público | Grátis e permanente, e o GitHub já está conectado. |
| Modelo | Visual Gold com funções da Platinum | Preferência do usuário. |
| Teclado | Legendas da Platinum desenhadas no estilo Gold | Toda função fica visível na posição real da Platinum. |
| Orientação | Só paisagem | Fiel à original. |
| Rotação | Lado fixo, sem sensor de movimento | Não pede permissão ao usuário. |
| Som | Clique opcional, desligado por padrão | Compensa a falta de vibração no PWA. |

## 3. Arquitetura

Site estático em JavaScript puro, com módulos ES e **sem etapa de build**. A única dependência é `decimal.js` (MIT), copiada para `vendor/`.

O motor (`src/engine/*` e `src/display.js`) não conhece o DOM. Ele recebe **códigos de tecla** e devolve o **estado do display**, o que permite testá-lo inteiro em Node.

```
index.html               casca da página, meta tags do iOS, carrega src/main.js
manifest.webmanifest     nome, ícones, display: standalone, orientação landscape
sw.js                    service worker: cache offline e atualização
icons/                   ícones do app (180px apple-touch-icon, 192px, 512px)
vendor/decimal.mjs       aritmética decimal
src/
  main.js                liga motor, UI e persistência
  engine/
    number.js            valores decimais: 10 dígitos de mantissa, arredondamento, overflow/underflow
    keys.js              tabela de teclas: código (linha/coluna, ex.: 11 = n), legendas primária/f/g
    calculator.js        máquina de estados: pilha X/Y/Z/T, LSTx, stack lift, prefixos f/g/STO/RCL/GTO,
                         entrada de dígitos, modos, registradores, undo, backspace, erros
    alg.js               modo algébrico: cálculo em cadeia da esquerda para a direita (sem precedência, como a Platinum), parênteses (até 13)
    finance.js           TVM (incluindo período fracionário simples/composto), AMORT, NPV, IRR, CFo/CFj/Nj,
                         PRICE/YTM, SL/SOYD/DB, INT, 12x, 12÷
    dates.js             DATE, ΔDYS (real e 30/360), D.MY/M.DY
    stats.js             Σ+, Σ−, x̄, s, x̂/r, ŷ/r, x̄w
    mathfn.js            %, Δ%, %T, yˣ, 1/x, √x, eˣ, LN, FRAC, INTG, n!, x², RND
    program.js           memória de programa (até 400 linhas), gravação/listagem, execução, SST/BST,
                         GTO, x≤y, x=0, PSE, R/S, conversão registradores ↔ linhas, MEM
  display.js             estado → segmentos do LCD: FIX 0–9, SCI, PREFIX, separadores . ou ,
                         "Error n", "Pr Error", listagem de programa ("001-   25"), indicadores
  storage.js             memória contínua: serializa/restaura o estado completo em localStorage
  ui/
    calculator-view.js   desenha a calculadora (SVG) e mapeia as áreas de toque → códigos de tecla
    lcd.js               LCD de 7 segmentos com vírgulas/pontos e indicadores
    input.js             pointer events, tecla pressionada, bloqueio de zoom/seleção/menu de toque longo
    orientation.js       rotação por CSS quando o viewport está em retrato
    sound.js             clique opcional (Web Audio)
tests/                   node --test
docs/reference/platinum-reference.md   referência de teclas, funções e exemplos, extraída do manual
```

### 3.1 Fluxo de dados

```
toque → input.js → código de tecla → calculator.press(code) → novo estado
      → display.render(state) → lcd.js desenha
      → storage.save(state)   (após cada tecla)
```

Operações longas (IRR, cálculo de i, programas em execução) rodam em fatias, cedendo ao navegador entre iterações. Durante esse tempo o LCD pisca "running", e qualquer tecla interrompe, como na original.

### 3.2 Números

- Mantissa de 10 dígitos significativos e expoente de −99 a 99. Todo resultado é arredondado para 10 dígitos (meio para cima), como na HP.
- Em cálculos internos com várias etapas (TVM, IRR, bonds), a precisão intermediária é maior, e o resultado final é arredondado para 10 dígitos.
- Overflow: resultado com |x| > 9,999999999E99 vira ±9,999999999E99 e o display mostra `9.999999 99`. Underflow: |x| < 1E−99 vira 0.

## 4. Comportamento

A referência completa está em `docs/reference/platinum-reference.md`. Resumo:

- **Teclado:** mapa 4×10 da Platinum, com ENTER ocupando a coluna 6 das linhas 3 e 4. Estão incluídas as funções exclusivas da Platinum:
  - RPN = `f CHS`, ALG = `f EEX`;
  - `(` = `g STO`, `)` = `g RCL`;
  - UNDO = `g ÷`, backspace = `g −`;
  - x² = `g ×`, LSTx = `g +`;
  - "=" é a legenda azul do ENTER, e OFF fica acima do ON.
- **RPN:** pilha de 4 níveis, com as regras de stack lift do manual. ENTER, CLx, Σ+ e Σ− desabilitam o lift; operações de dois números derrubam a pilha e duplicam T.
- **ALG:** o próprio ENTER funciona como "=", e `g ENTER` também. Não há precedência: a conta é feita em cadeia, da esquerda para a direita (456 − 75 ÷ 18,5 × 68 ÷ 1,9 = 737,07, como no manual). Há até 13 parênteses abertos (o 14º dá Error 4).
- **Display:** 10 dígitos. `f 0`–`f 9` define FIX (com 9 pedido, mostra 8 casas). `f .` define SCI, com mantissa de 7 dígitos e expoente de 2. O display troca sozinho para notação científica quando o número não cabe. `f PREFIX` mostra os 10 dígitos da mantissa enquanto a tecla está pressionada.
- **Indicadores:** f, g, BEGIN, D.MY, C, PRGM, RPN/ALG e `( )`.
- **Memória de programa:** no reset são 8 linhas e 20 registradores. Cada registrador, a partir de R.9 para baixo, vira 7 linhas quando o programa cresce, até 400 linhas. `g MEM` mostra `P-08 r-20` no reset. Os fluxos de caixa (CF0..CF80) ocupam a mesma memória.
- **Arredondamento interno:** só RND, AMORT, SL, SOYD e DB arredondam o valor interno para as casas exibidas.
- **Erros:** Error 0–9 nas condições do Apêndice D do manual (tabela na referência). Qualquer tecla limpa o erro sem executar a função.
- **Combinações com ON** (segurar ON, apertar a tecla, soltar ON e depois a tecla):
  - ON + `.` troca o separador decimal;
  - ON + `−` faz o reset da memória contínua ("Pr Error");
  - ON + `×` roda o autoteste completo;
  - ON + `÷` roda o teste de teclado/display.
- **ON sozinho:** liga e desliga (apaga o display), mantendo toda a memória.
- **Memória contínua:** pilha, LSTx, registradores, programa, formato do display, D.MY/M.DY, BEGIN/END, RPN/ALG, C e separador sobrevivem ao fechar o app e reiniciar o iPhone.

### 4.1 Fora do escopo

Ficam de fora o desligamento automático por inatividade, o indicador de bateria, o ajuste de contraste do LCD (`f` segurado + `+`/`−`) e o autoteste contínuo (ON + `+`, cuja tecla não foi confirmada no manual). Também não haverá app nativo, sincronização entre aparelhos ou publicação na App Store.

### 4.2 Pontos não documentados e decisões adotadas

1. **Memória de programa:** conversão de 7 linhas por registrador, a partir de 8 linhas/20 registradores, até 400 (segue o manual).
2. **"=" no ALG:** o ENTER funciona como "=" sem precisar do g.
3. **Solução de IRR e de i:** Newton com bisseção de segurança, convergindo até o NPV ser zero em 10 dígitos. Error 3 sai quando não converge (depois de um limite de iterações) e Error 7 quando não há troca de sinal nos fluxos.

Se o usuário tiver uma Platinum física, esses são os pontos a conferir.

## 5. Visual e interação

- **Proporção:** a calculadora inteira em SVG, na proporção real de 128 × 79 mm, ocupando toda a altura da tela deitada. As sobras laterais ficam num fundo escuro neutro, respeitando as safe areas (Dynamic Island e barra inferior).
- **Aparência Gold:**
  - painel superior dourado escovado, com a faixa do logo "hp 12C" e a moldura do LCD;
  - área do teclado preta;
  - teclas pretas com legendas brancas, funções f em dourado acima da tecla e funções g em azul na face inferior;
  - tecla f dourada, tecla g azul, ENTER alto com texto vertical;
  - colchetes dourados "BOND", "DEPRECIATION" e "CLEAR" sobre as teclas;
  - ON levemente rebaixado.
- **LCD:** fundo cinza-esverdeado, dígitos de 7 segmentos desenhados em SVG com vírgulas/pontos e indicadores embaixo.
- **Toque:** a tecla responde no pointerdown, sem o atraso de 300 ms, e afunda visualmente enquanto está pressionada. Zoom, seleção, menu de toque longo e o "quique" da página ficam desativados.
- **Orientação:** o manifest pede paisagem. Se o viewport estiver em retrato (por exemplo, com o bloqueio de rotação ligado), a calculadora é desenhada girada 90° com o CSS `rotate(90deg)`, de modo que fique em pé com a Dynamic Island à esquerda. Os toques são mapeados considerando essa rotação. Com o bloqueio desligado, o iOS gira a página sozinho para os dois lados.
- **Som:** clique curto via Web Audio, desligado por padrão. Liga/desliga segurando ON sozinho por 2 s. Para isso funcionar, o ON age **ao soltar**:
  - soltou antes de 2 s, sem outra tecla no meio: liga/desliga a calculadora;
  - segurou ≥ 2 s sem outra tecla: alterna o som e mostra `SOUnd On` ou `SOUnd OFF` no LCD por 1 s, sem ligar/desligar;
  - outra tecla apertada enquanto ON está segurado: é uma das combinações da seção 4.

## 6. Persistência e atualização

- O estado é salvo em `localStorage` após cada tecla. Apps na Tela de Início têm armazenamento próprio e persistente.
- Se o estado salvo for inválido ou de uma versão incompatível, o app faz o reset de fábrica e mostra "Pr Error", como a HP faz quando perde a energia.
- O service worker guarda todos os arquivos em cache e funciona offline. Quando uma versão nova é publicada, ela é baixada em segundo plano e entra na próxima abertura, sem perder o estado.

## 7. Testes

- **Motor (Node, `node --test`):**
  - todos os exemplos da seção 5 da referência, no formato "sequência de teclas → texto do display";
  - testes de stack lift, de FIX/SCI/PREFIX, de separadores, de cada condição de Error, de ALG em cadeia e com parênteses, de undo/backspace, de gravação/execução/listagem de programa e da conversão de memória;
  - ida e volta do estado pela serialização.
  - Os exemplos marcados [CALC] na referência (calculados pelo pesquisador, não impressos no manual) são conferidos de forma independente antes de virarem teste.
- **Visual:** screenshots via Playwright num viewport de iPhone deitado e em retrato (para conferir a rotação), comparados às fotos de referência.
- **Aceitação:** o usuário instala no iPhone e confere o visual e alguns cálculos.

## 8. Entrega

1. Repositório GitHub público (nome sugerido: `hp12c`) com GitHub Pages ativado.
2. O link é enviado ao usuário, junto com as instruções de instalação: Safari → Compartilhar → Adicionar à Tela de Início.
