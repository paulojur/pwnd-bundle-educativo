# AUDIT.md (estado de continuidade)

## Posição: FASE 2 concluída (modo hot-seat). Auditoria finalizada; nada mais a fazer sem novo pedido (Fase 3 i18n em outro chat).

## Ambiente
- `node`/`npx` NÃO estão no PATH do sandbox; python 3.13 sim. Sem madge. Grafo via `scratch/graph.py` (regex de imports estáticos/dinâmicos) → `scratch/reachable.txt`. Usar python nos scripts.
- Pasta `.git` existe, mas `git` não está no PATH (não deu para ver último commit). Último mtime de src/: 2026-11-08. AUDITORIA_LIMPEZA_CODIGO.md mtime: 2026-11-10 11:06 (cópia/edição de hoje; não prova que reflete o código).

## Arquivos ativos
- Entry: index.html e game.html (vite input) → `/src/main.tsx` → `App.tsx` → `export function App` renderiza só `<LanguageProvider><BoardGameMain/>`.
- `App.tsx:14` `CardGameContent` (modo cartas legado) é definido mas NUNCA renderizado (grep: só 1 ocorrência). Seus imports (GameContext, Header, ArchetypeSelector, GameBoard, Hand, PatchModal, TerminalLog, e daí CardView, RulebookHelpModal, gameRules.ts) mantêm esses arquivos "alcançáveis" no grafo estático, mas mortos em runtime.
- Runtime real: BoardGameMain, BoardGameContext, ActionPointsBar, AlertTracker, BoardHand, BoardMap, BountyLedgerModal, CenterMarketMat, FullTableView, PlayerMat, EventCardModal, MultiplayerLobbyModal, PlayerAidModal, ProgramSelectorModal, PrintAndPlayModal, DiceRoller, utils/{audio,gameRulesV14,multiplayerSync,supabaseSync,pnp-dimensions}, i18n/*.

## Divergências relatório × grafo (confirmadas por grep)
| arquivo | relatório | grafo |
|---|---|---|
| ArchetypeSelector, CardView, GameBoard, Hand, Header, PatchModal, RulebookHelpModal, TerminalLog, context/GameContext, utils/gameRules | ÓRFÃO | alcançável estático via App.tsx (só do `CardGameContent` morto) → morto em runtime; relatório certo na prática |
| utils/multiplayerSync.ts | ÓRFÃO | **ATIVO**: BoardGameContext.tsx:21 (import), :558 (uso mpSync). Relatório errado |
- Relatório cita arquivos ativos todos alcançáveis; nenhum "ATIVO" inalcançável.

## Arquivo de cartas em uso (runtime do jogo)
- **canonicalV14Data.ts** alimenta o jogo real: BoardGameContext.tsx:144 (deck principal 84 via buildCanonicalV14MainDeck), :153 (ferramentas 48), :171 (programas, V14_PROGRAMS→CANONICAL_PROGRAMS :80), arquétipos V14_ARCHETYPES :92, eventos buildCanonicalV14EventDeck. 
- boardData.ts: SERVERS_DATA (BoardGameContext:18, BoardMap).
- cardsData.ts: só tipos (ProgramCard, Archetype) no runtime do board; ARCHETYPES/PROGRAM_CARDS usados por BoardGameMain:12, ProgramSelectorModal, PrintAndPlayModal, PlayerMat (VERIFICAR na Fase 1 se BoardGameMain usa a lista antiga em vez da canônica = possível conflito de dados).
- cardsDataV2.ts: tipo CardV2 + getClassBadgeInfo; CARDS_V2 só em PrintAndPlayModal.
- full80DeckData.ts e full24EventsData.ts: só PrintAndPlayModal (+ tipo EventCardData). NÃO alimentam baralho/mercado real.
- Atenção Fase 1: os 6 arquivos podem divergir entre si; comparar canonicalV14Data (principal) e, secundariamente, os usados em PnP.

## Localização da lógica
- Tudo em `src/context/BoardGameContext.tsx` (1559 linhas): setup createInitialGameState:143, completeSetup:518, resetBoardGame:528, addAlertaToken:439, removeAlerta:456, eventos applyEventCardEffect:611/drawEventCard:842, ações varrer:861/infiltrar:889/reportar:1045/phishing:1370, dado handleDiceRollResult:1243, endTurn:1279, finalizeTurnAdvance:1402, patch defusePatch:1296/acceptPatch:1332, modos setGameMode:513 (solo|hotseat|lan).
- Regras auxiliares: `utils/gameRulesV14.ts` (195 linhas; getPatchThreshold, BOUNTY_MILESTONES, checkCardScopeV14). Mercado: programas em CenterMarketMat; vitória/derrota a localizar na Fase 2.
- PA: ActionPointsBar (UI) + estado em BoardGameContext.

## i18n
- `i18n/LanguageContext.tsx` (LanguageProvider, useLanguage, localStorage `pwnd_lang`, 'pt'|'en') + `translations.ts` (dicionário) + `cardTranslations.ts` (getLocalizedCardDescription/ScopeBadge). Fase 3 fora de escopo.

## Fontes
- Manual: Screentop/pwned-manual-sucesso-v1.html
- TSV (Screentop/TSV): arquetipos_6, ferramentas_48, jokers_e_creditos_6, player_aids_6, programas_36, safeguards_10, vulnerabilidades_80. **Não há TSV de eventos (24)** → a comparação dos 24 eventos só será possível via manual; registrar como pendência.

## Fase 1 — resultado (script scratch/cmp.py e cmp2.py)
- TSV bem convertidos (acentos ok; arquetipos_6 tem coluna Id = nome da habilidade, Title = nome do arquétipo; ferramentas repetem linhas = cópias). eventos_24.tsv agora existe.
- **canonicalV14Data.ts (runtime real) vs TSV: 0 diferenças** em vulnerabilidades (80), ferramentas (48 = 12x4), programas (36), eventos (24), safeguards (12 = 8 bypass + 4 cve), arquetipos (6): id, nome, subtítulo, classe, raridade, bounty, CVSS, noise, texto, shortDesc, limiar de patch, cópias.
- Baralho principal = 80 vulns + 2 bypass + 2 CVE (canonicalV14Data.ts:2663) — manual a confirmar na Fase 2.
- Valores do tabuleiro (boardData): sem TSV; só conferir contra o manual na Fase 2.
- BoardGameMain.tsx:12 importa ARCHETYPES/PROGRAM_CARDS mas não usa (só linha 12): inofensivo.
- **PnP-only (não afeta o jogo)**: full24EventsData.ts: 24 ids iguais ao TSV, mas texto diverge nos 24 (nome ok em evt-04; corpo diferente) — design/texto legado. full80DeckData.ts: 102 ids, 0 em comum com TSV de vulnerabilidades (baralho legado inteiro, ids inj-1 etc., nomes antigos), 3 defuses vs 12 safeguards. PrintAndPlayModal imprime esses dados legados ≠ TSV. NÃO corrigido (design/carta nova-removida) → Conflitos/Pendências.

## Conflitos manual × TSV
(nenhum identificado ainda; checar na Fase 2)

## Conflitos código-PnP × TSV (não corrigidos)
- PrintAndPlayModal usa full80DeckData/full24EventsData legados (ver acima). Decisão do usuário: religar PnP em canonicalV14Data ou aceitar.


## Corrigido (arquivo:linha)
- BoardGameContext.tsx:1272-1285 selectNewProgram: trocar programa já ativo agora custa 1 AP, exige a vez e descarta as vulns da Zona de Exploits (manual §03 RECON). Antes: troca grátis, ilimitada, sem descarte. Escolha com programa nulo (1º turno / após Report ou Patch) segue grátis.
- BoardGameContext.tsx:~1447 finalizeTurnAdvance: setPlayers funcional; antes sobrescrevia (snapshot velho) efeitos de Evento aplicados no mesmo Report (alerta/score/mão).
- Não validado: node/tsc indisponíveis no sandbox; rodar `npm run build`.

## Conferido OK (hot-seat)
3 AP; Report=2AP, encerra turno; Noisy 2D6/Stealth 3D6-maior (marcador NOISY força Noisy); limiares 10/9/8/7; Patch (perde exploits+programa, +1 alerta, consolação); Bypass (sem Tool/consolação, +1 alerta); 2 alertas=-$2.000; Furtivo/mesa limpa remove 1 alerta; $40k vence; fim 8ª rodada = score+500*rep-500*alerta; ordem do Report; rep Épica/Lendária; bônus Old Guard/Bug Hunter/Pentester/Red Teamer; limites 3 exploits/3 tools; troca de myRole no hot-seat; mão 5+Bypass.

## Pendências de lógica (por prioridade)
(b) regra diferente do manual
1. Setup dá 5 cartas a 6 jogadores sempre (createInitialGameState:175-269): em duelo 20 cartas presas (Main Deck 54, não 74).
2. Instalar Tool "1x/turno" não imposto (moveCardToToolsRack:~969).
3. Duelo (2 jog.): rotação de mercado após Report ausente.
4. Programa perdido/trocado não sai do mercado nem é reposto; 2 jogadores podem usar o mesmo.
5. +1 mão do Browser DevTools ignorado (dynamicMaxHandSize:481; UI BoardHand:92/99).
6. Empate na 8ª rodada: 1º jogador vence; manual não detalha.
7. Roubo de Reputação ausente.
(c) efeito ausente/diferente
8. applyEventCardEffect:611-840 cobre só ~9 dos 24 eventos; alvo = sempre 1º oponente; evt-14 descarta a 1ª carta, não aleatória.
9. Tools: sem efeito Passivo/Ativo (só instalar).
10. n00b e Social Engineer (redirecionar evento) ausentes; Phishing pega sempre a 1ª carta do 1º oponente.
11. Vulns especiais (CORINGA DE ESCOPO, DESVIO DE PAGAMENTO, ACESSO INTERNO) não verificadas.
12. drawEventCard:842 executa efeitos dentro de updater (StrictMode dobra em dev).
(Fora de escopo) PnP legado: full80DeckData/full24EventsData.


## Rodada de correções 2 (12:55)
- #1 BoardGameContext.tsx:~1473-1485 finalizeTurnAdvance: fim da 8ª rodada com desempate 🐝 → menos 🐞 → vitória compartilhada (nomes "A & B"). Manual §08.
- #2 processSuccessfulReport:~1238 + selectNewProgram:~1294: após Report bem-sucedido (inclui Bypass) o turno só avança depois de escolher programa (estado awaitingProgramPick; endTurn bloqueado).
- #3 limite de mão só no fim do turno: ActionPointsBar.tsx, BoardHand.tsx; finalizeTurnAdvance trava se mão > limite.
- #4 CenterMarketMat.tsx: clique manual no Event Deck desativado (Evento só via Report).
- #5 abandonActiveProgram / selectNewProgram: troca voluntária exige vez + 1 AP.
- #6 createInitialGameState(count): deal só para jogadores ativos; setPlayerCount ajusta mãos e Main Deck.

## Rodada de correções 3 (Arquétipos randômicos, Mercado/Deck Surpresa, 24 Eventos, 12 Tools e Métricas do Observador)
- `src/context/BoardGameContext.tsx:249-336` + `:711`: `createInitialGameState` e `resetBoardGame` embaralham `CANONICAL_ARCHETYPES` via `shuffleArray` a cada início/reinício de partida (manual §02).
- `src/context/BoardGameContext.tsx:242-335`, `:1270-1375`, `:1860-1915`: setup retira do baralho de 36 programas (18×2 cópias com IDs únicos) os programas iniciais dos jogadores ativos e depois abre `programMarket` (3 expostos) + `programDeck` (restante); após **Report bem-sucedido** ou **Patch aceito (sem Bypass)**, `awaitingProgramPick=true` exige escolha imediata (entre os 3 expostos ou `drawSurpriseProgramFromDeck`) antes de avançar o turno; troca voluntária (1 AP) abre `ProgramSelectorModal` sem zerar `activeProgram` antes da confirmação; corrigida dupla chamada em `CenterMarketMat.tsx:254-354` + `BoardGameMain.tsx:612`.
- `src/context/BoardGameContext.tsx:722-1197`, `:1620-1812` + `src/components/EventCardModal.tsx:16-245`: implementados todos os **24 Eventos (`evt-01`..`evt-24`)** fora de state updater (sem snapshot obsoleto), com escolha interativa de oponente em mesa >2J (`evt-02`, `evt-04`, `evt-14`), redirecionamento do **Social Engineer** (1×/partida) e resumo de resolução no modal.
- `src/data/cardsDataV2.ts:31-41`, `src/utils/gameRulesV14.ts:75-185`, `src/i18n/cardTranslations.ts:127-166`, `src/components/PlayerMat.tsx:214-292`, `src/components/BoardHand.tsx:31-244`, `src/context/BoardGameContext.tsx:1199-1455`: 48 Tools com `id` único por cópia + `toolId` (`T-01`..`T-12`), texto integral sem truncamento `.slice(0,45)`, limite de 1 instalação/turno, 8 Passivas (`T-01` Proxy, `T-02` Wordlist, `T-03` DevTools +1 mão, `T-04` Endpoint Lab BAC, `T-05` Burp Suite Reroll 1×/turno, `T-06` Nuclei +$500, `T-08` Injection Lab INJ, `T-10` Kali -$500/+$1.500) e 4 Ativas com botão `⚡ ATIVAR TOOL (DESCARTA)` (`T-07` SpiderScan, `T-09` FuzzStorm, `T-11` Hex Kitchen, `T-12` Panóptico) + poder do **n00b** (topo 3 Tool Deck via `DeckPeekModal`).
- `src/components/ObserverMetricsModal.tsx:1-340` + `src/components/BoardGameMain.tsx:461-549,645`: painel **🔭 Observador** e barra ao vivo registrando telemetria por jogador/arquétipo e log completo (`auditLogs`).
- Não validado: `node`/`tsc` ausentes no PATH do sandbox; rodar `npm run build` localmente.

