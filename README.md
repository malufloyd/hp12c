# HP 12C

Calculadora financeira HP 12C para iPhone, como app web instalável (PWA): visual da 12C Gold e funções da 12C Platinum (RPN e ALG, TVM, amortização, NPV/IRR, bonds, depreciação, datas, estatística e programação). Funciona offline e guarda a memória contínua no aparelho.

## Instalar no iPhone

1. Abra o link do app no **Safari**.
2. Toque em **Compartilhar** → **Adicionar à Tela de Início**.
3. Abra pelo ícone. A calculadora aparece deitada; com o bloqueio de rotação ligado, segure o iPhone com a Dynamic Island à esquerda.

Atalhos:
- **ON** liga e desliga.
- Segurar **ON** por 2 s liga ou desliga o clique das teclas.
- **ON** + `.` troca vírgula por ponto.
- **ON** + `−` apaga toda a memória.

## Desenvolvimento

- Sem build: é HTML, CSS e JavaScript puro (`index.html`, `src/`).
- Testes do motor: `npm test`. Os exemplos do manual da HP estão em `tests/`.
- Rodar localmente: `python3 -m http.server 8123` e abrir `http://localhost:8123`.
- Antes de publicar uma versão nova, rode `npm run stamp`, que atualiza a versão do service worker.
- A especificação e o plano estão em `docs/superpowers/`, e a referência de teclas e funções em `docs/reference/`.

Projeto pessoal; HP e HP 12C são marcas da HP Inc.
