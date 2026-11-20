# AUDIT 2 - Alinhamento Editorial, Pós-Playtest e Sincronização Físico/Digital

Registro das alterações aplicadas após análise das mecânicas, revisão dos playtests e unificação de texto entre os arquivos do Screentop (TSV e Manual HTML) e a versão digital em React/TypeScript.

Ordem de execução seguida: **TSVs -> Manual HTML -> Player Aids -> Código e Dados Digitais**.

---

## 1. Ajustes em Arquivos TSV (`Screentop/TSV/`)

1. **`Screentop/TSV/programas_36.tsv`**
   - **`GovPortal Legacy` (`govportal-1` e `govportal-2`)**: Bounty Base alterado de `$1.500` para `$1.000` (ajuste pós-playtest), com texto da carta atualizado.
   - **Programas `-2` diferenciados**: reescrita dos textos narrativos dos 6 programas `-2` que compartilhavam descrições repetidas (`veloce-2`, `aeroorbit-2`, `voltz-2`, `pulsestream-2`, `taxcore-2` e `biogen-2`).

2. **`Screentop/TSV/arquetipos_6.tsv`**
   - **`Red Teamer`**: custo do poder especial corrigido de `-$1.500` para `-$1.000`, acompanhando o balanceamento pós-playtest já aplicado na lógica digital.

3. **`Screentop/TSV/eventos_24.tsv`**
   - **Padronização dos 4 eventos de mesa vazia (`evt-01`, `evt-02`, `evt-09`, `evt-16`)**: substituição do jargão `"Whiff"` por redação acessível em português ("passa em branco" / "quem estiver com a mesa vazia não sofre efeito") e alinhamento de `evt-01` (`Blue Team Hunt!`) para também não punir quem estiver sem exploits na mesa.

4. **`Screentop/TSV/vulnerabilidades_80.tsv`**
   - **Reescrita de 47 cartas `FLAVOR`**: substituição de descrições secas ou excessivamente técnicas por cenas diretas conectadas às empresas do universo do jogo (`AUTH-2` a `AUTH-8`, `BAC-2` a `BAC-10` e `BAC-12`, `BL-2`, `BL-3`, `BL-5`, `BL-7`, `CRYPTO-2` a `CRYPTO-5`, `INJ-3` a `INJ-11` e `INJ-16`, `SSRF-3`, `SSRF-4`, `SSRF-6`, `APT-2`, `XSS-2` a `XSS-9`).

---

## 2. Manual HTML (`Screentop/pwned-manual-sucesso-v1.html` e `public/pwned-manual-sucesso-v1.html`)

- **Fonte da verdade única e espelhamento**: todas as alterações foram feitas primeiro em `Screentop/pwned-manual-sucesso-v1.html` e depois espelhadas de forma idêntica em `public/pwned-manual-sucesso-v1.html`.
- **Limpeza editorial**: remoção do texto residual de exportação no final do arquivo e substituição de travessões longos/médios por pontuação comum, preservando leitura natural.
- **Seção 01 (Ambientação e Fim de Jogo)**: inclusão da explicação direta de por que os times de segurança das empresas aplicam Patch quando alguém tenta faturar e atualização da condição de encerramento para `$40.000` (com Turnos Iguais até fechar a rodada) ou 10 rodadas.
- **Seção 04 (Bypass)**: enquadramento do Bypass como o segundo golpe quando uma correção rápida da empresa deixa outra brecha aberta.
- **Seção 06 (Arquétipos e Poderes)**: correção do custo do `Red Teamer` para `-$1.000` e alinhamento dos efeitos de `#INJ-2`, `#INJ-14`, `#INJ-15` e `#APT-4` seguindo o TSV.
- **Seção 07 (Eventos)**: uniformização dos 4 eventos de mesa vazia (`evt-01`, `evt-02`, `evt-09`, `evt-16`) sem perda de carta na mão e sem o termo `"Whiff"`.
- **Seção 08 (Trilha e Casas Especiais)**: inclusão de nomes temáticos para os 8 marcos da trilha de Bounty (`Primeira Manchete`, `Na Mira da Segurança`, `Convite VIP`, `Rastro Descoberto`, `Patrocínio de Elite`, `Estrela da Conferência`, `Mordida do Leão` e `Inimigo Público nº 1 dos Bugs`) e registro da regra de Turnos Iguais ao alcançar `$40.000`.
- **Seção 09 (Guia Rápido)**: atualização para 10 rodadas e fechamento de rodada em Turnos Iguais.
- **Seção 10 (Catálogo Completo)**: atualização do `GovPortal Legacy` para `+$1.000`, inclusão dos 47 textos narrativos de vulnerabilidades `FLAVOR` e correção das fichas de `#INJ-2`, `#INJ-14`, `#INJ-15` e `#APT-4`.
- **Decisão registrada sobre mesa física**: não foi adicionada regra ou ritual de leitura narrativa durante a partida para não interromper o fluxo leve do jogo em momentos de descanso.

---

## 3. Player Aids

1. **`Screentop/TSV/player_aids_6.tsv`**
   - Atualização das 6 cartas de referência rápida nas colunas `AcaoLivre_Instalar`, `Patch_Defesa`, `Casas_Especiais` (listando os 8 marcos nomeados da trilha) e `Vitoria_Regra` (`$40.000` com Turnos Iguais até o fim da rodada ou final da 10ª rodada).

2. **`src/components/PlayerAidModal.tsx`**
   - Remoção de travessões longos na interface em português e inglês.
   - Inclusão dos 8 Marcos da Trilha (`Marcos da Trilha` / `Board Milestones`) e atualização da regra de vitória para `$40.000` (com Turnos Iguais) ou 10ª rodada.

---

## 4. Código e Dados do Jogo Digital (`src/`)

1. **`src/data/canonicalV14Data.ts`**
   - Sincronização de 57 descrições diretamente dos TSVs atualizados (47 vulnerabilidades `FLAVOR`, 6 programas `-2` e 4 eventos de mesa vazia) e remoção de travessões longos.

2. **`src/context/BoardGameContext.tsx`**
   - **`evt-01` (`Blue Team Hunt!`)**: removida a punição alternativa de descarte da mão para quem estiver com a mesa vazia; agora todos os 4 eventos de mesa vazia (`evt-01`, `evt-02`, `evt-09`, `evt-16`) passam em branco sem punir mesa vazia.
   - **Remoção de `"Whiff"`**: mensagens de log de `evt-02`, `evt-09` e `evt-16` reescritas com texto claro de mesa vazia / passou em branco.
   - **Registro automático de combos**: cada `Report Concluído` agora inclui `Combo: [...] ->` nos detalhes do histórico de auditoria.

3. **`src/components/ObserverMetricsModal.tsx`**
   - Criação e exportação da função `computeMatchHighlights`, que extrai do histórico e da telemetria: Maior Tacada (com combo usado), Maior Tombo (Patch), Operação Mais Limpa e um título de destaque por jogador.
   - Exibição do painel **Destaques da Partida** no modal do Observador e inclusão nos relatórios exportados em Markdown, HTML e reconstrução da nuvem.
   - Limpeza de travessões longos.

4. **`src/components/BoardGameMain.tsx`**
   - Exibição discreta do painel **Destaques da Partida** (**Match Highlights**) no modal final de vitória, logo abaixo do pódio e antes da enquete de playtest, permitindo leitura rápida opcional no fim do jogo.
   - Limpeza de travessões longos no cabeçalho, barra de log e modal de vitória.

---

## 5. Padronização Gráfica da Caixa (216 Cartas) & Reestruturação da Seção 02

1. **Meta Gráfica de Produção: 4 Baralhos de 54 Cartas = 216 Cartas**
   - Removidas as 2 cartas de variantes físicas (`variant-hackathon` e `variant-nightmare`) do arquivo `Screentop/TSV/jokers_e_creditos_6.tsv` (mantidas 4 cartas: 3 Coringas customizáveis + 1 Carta de Créditos Oficiais). Criado também `jokers_e_creditos_4.tsv`.
   - Total de cartas físicas na caixa perfeitamente cravado em **216 cartas**: 80 Vulnerabilidades + 48 Ferramentas + 36 Programas + 24 Eventos + 12 Safeguards (8 Bypass + 4 CVE) + 6 Arquétipos + 6 Player Aids + 4 Especiais (3 Coringas + 1 Créditos).

2. **Alinhamento do Main Deck (86 Cartas)**
   - Confirmada a inclusão das **4 cartas CVE Assignment Protection** no Main Deck (aumentando a probabilidade de compra de 2,3% para 4,6% num baralho de compra ativo).
   - Main Deck montado: **80 Vulnerabilidades + 2 Bypass + 4 CVE Assignment Protection = 86 cartas**.
   - Atualizados `src/data/canonicalV14Data.ts` (`cveInDeck.slice(0, 4)`), `src/components/CenterMarketMat.tsx` (rótulo 86 cartas) e `src/context/BoardGameContext.tsx` (`canonicalMainDeck`).

3. **Reestruturação Completa da Seção 02 nos Manuais HTML**
   - Atualizados [`public/pwned-manual-sucesso-v1.html`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/public/pwned-manual-sucesso-v1.html) e [`Screentop/pwned-manual-sucesso-v1.html`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/Screentop/pwned-manual-sucesso-v1.html).
   - **Subseção 1 (Conteúdo da Caixa)**: Inventário completo, claro e isolado dos 216 componentes e acessórios físicos.
   - **Subseção 2 (Setup Rápido da Mesa)**: Passo a passo claro para 2 a 6 jogadores, explicitando a montagem do Main Deck com 86 cartas, a entrega de 1 Bypass e 5 cartas a cada jogador, e o que retorna para a caixa.
   - **Variantes de Regra**: As regras do *Modo Hackathon Blitz* e *Modo Nightmare Ops* foram incorporadas como variantes opcionais em destaque no texto da Seção 02, sem ocupar cartas físicas da caixa.

