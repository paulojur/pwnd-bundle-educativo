# Auditoria de Código e Árvore de Dependências — PWND! Bug Bounty Chaos

> **Data da Auditoria:** 10 de Novembro de 2026  
> **Escopo:** Análise estática de dependências a partir dos Entry Points para segregação de ativos em produção e eliminação de código morto / legado.

---

## 1. Visão Geral e Entry Points

O projeto passou por múltiplas iterações arquiteturais:
1. **Versão 1.0 (Card Game / Terminal):** Interface baseada em console hacker, seleção de arquétipo modal e baralho de cartas original (`MASTER_DECK`).
2. **Protótipo Intermediário de Mapa:** Sistema de movimentação de peões em nós de servidores corporativos (`BoardMap`, `boardData.ts`, `AlertTracker`).
3. **Versão 2.0 / V1.4 Canônica (Board Game Edition - ATUAL):** Mesa com tapetes de neoprene (`CenterMarketMat`, `PlayerMat`, `BoardHand`), dados D6 para patch speed (`DiceRoller`), baralhos V1.4 (`canonicalV14Data.ts`) e multiplayer via Supabase Realtime (`supabaseSync.ts`).

### Mapeamento do Fluxo de Execução
```
index.html / game.html
  │
  ▼
src/main.tsx
  │
  ├─► src/index.css (Estilos globais da mesa)
  │
  ▼
src/App.tsx
  │
  ├─► <LanguageProvider> (src/i18n/LanguageContext.tsx)
  │     └─► src/i18n/translations.ts
  │
  └─► <BoardGameMain> (src/components/BoardGameMain.tsx)  [PRODUÇÃO REAL]
        │
        ├─► [BLOCO MORTO: CardGameContent (linhas 14-107) — NUNCA RENDERIZADO]
```

---

## 🟢 ATIVO EM PRODUÇÃO
*(Componentes, contextos, módulos de dados e utilitários que sustentam a aplicação em execução)*

### 1. Núcleo e Infraestrutura Web
| Arquivo | Função / Responsabilidade |
| :--- | :--- |
| `index.html` | Entry point HTML principal do Vite. |
| `src/main.tsx` | Ponto de entrada TypeScript; instancia o React DOM no elemento `#root`. |
| `src/App.tsx` | Componente raiz que envelopa a aplicação com `LanguageProvider` e monta `BoardGameMain`. |
| `src/index.css` | Folha de estilo global (variáveis de cor, estilo de tapete de neoprene e mesa de madeira). |
| `package.json` & `package-lock.json` | Dependências ativas do ecossistema Node/React/Supabase/Lucide. |
| `tsconfig.json` | Configuração do compilador TypeScript. |
| `vite.config.ts` | Configuração de build e portas do servidor de desenvolvimento. |

### 2. Contexto de Estado (State Management) & Internacionalização
| Arquivo | Função / Responsabilidade |
| :--- | :--- |
| `src/context/BoardGameContext.tsx` | Motor central do jogo: ciclos de rodada, reserva de 3 PA, ações (Infiltrar, Varrer, Reportar), estoques dos baralhos e cálculo de vitória. |
| `src/i18n/LanguageContext.tsx` | Contexto de internacionalização (alternância dinâmica PT-BR / EN-US). |
| `src/i18n/translations.ts` | Dicionário de termos técnicos, menus, botões e mensagens do sistema. |
| `src/i18n/cardTranslations.ts` | Tradução de descrições e títulos específicos de cartas. |

### 3. Componentes de Interface (UI)
| Componente | Função / Responsabilidade |
| :--- | :--- |
| `src/components/BoardGameMain.tsx` | Componente mestre; gerencia visões (`myMat`, `centerTable`, `fullTable`) e modais do jogo. |
| `src/components/CenterMarketMat.tsx` | Tapete central; expõe os mercados de Programas, Ferramentas e Exploits, além da trilha de bounty. |
| `src/components/PlayerMat.tsx` | Tapete de neoprene individual de cada jogador na mesa. |
| `src/components/BoardHand.tsx` | Visualização da mão de cartas em leque com interações de descarte e instalação. |
| `src/components/ActionPointsBar.tsx` | Barra de comando inferior; controla os 3 Pontos de Ação (PA), stealth mode e passagem de turno. |
| `src/components/DiceRoller.tsx` | Mecanismo de rolagem de dados D6 para teste de patch speed com base no limiar corporativo. |
| `src/components/EventCardModal.tsx` | Modal de revelação e aplicação de efeitos de cartas de eventos de caos. |
| `src/components/FullTableView.tsx` | Modo de visualização global exibindo o progresso de todos os jogadores simultaneamente. |
| `src/components/MultiplayerLobbyModal.tsx` | Criação e entrada em salas multiplayer com código de sala. |
| `src/components/BountyLedgerModal.tsx` | Modal contábil exibindo histórico de recompensas e relatórios aceitos. |
| `src/components/PlayerAidModal.tsx` | Resumo de auxílio ao jogador com custos de ações e regras essenciais. |
| `src/components/PrintAndPlayModal.tsx` | Interface de pré-visualização e geração das folhas de impressão física PnP. |

### 4. Módulos de Regras, Dados e Utilitários
| Arquivo | Função / Responsabilidade |
| :--- | :--- |
| `src/data/canonicalV14Data.ts` | Acervo canônico oficial V1.4 de cartas de Vulnerabilidades, Ferramentas, Programas, Eventos e Safeguards. |
| `src/data/cardsDataV2.ts` | Definição da interface `CardV2` e categorizador de badges `getClassBadgeInfo`. |
| `src/data/cardsData.ts` | Utilizado exclusivamente para importação dos arrays `ARCHETYPES` e `PROGRAM_CARDS`. |
| `src/data/full80DeckData.ts` | Fonte de dados do baralho completo consumida pelo modal de impressão Print & Play. |
| `src/data/full24EventsData.ts` | Fonte de dados dos 24 eventos de caos consumida pelo PnP e pelo `EventCardModal`. |
| `src/utils/audio.ts` | Motor de efeitos sonoros sintéticos procedural via Web Audio API. |
| `src/utils/gameRulesV14.ts` | Lógica determinística de limiares de patch, tabela de bounty milestones e verificação de escopo. |
| `src/utils/supabaseSync.ts` | Gerenciador de conexão e sincronização via Supabase Realtime Channels. |
| `src/utils/pnp-dimensions.ts` | Calibração de medidas milimétricas e regras CSS de impressão para PnP. |

### 5. Ativos Estáticos Ativos (`public/`)
| Arquivo | Função / Responsabilidade |
| :--- | :--- |
| `public/images/bounty_track_central.jpg` | Arte da trilha central de pontuação renderizada em `CenterMarketMat.tsx`. |
| `public/pwned-manual-sucesso-v1.html` | Manual oficial do jogo aberto via botão de ajuda na interface. |

---

## 🔴 LEGADO / CÓDIGO MORTO / ÓRFÃOS
*(Arquivos e blocos de código sem dependência na versão em execução que devem ser deletados)*

### 1. Arquivos Órfãos dentro de `src/` (15 arquivos)

#### Componentes Descontinuados
* `src/components/AlertTracker.tsx` (124 linhas) — Rastreador de nível de alerta do mapa descartado.
* `src/components/ArchetypeSelector.tsx` (84 linhas) — Seletor de arquétipo modal do jogo de cartas v1.0.
* `src/components/BoardMap.tsx` (130 linhas) — Protótipo de tabuleiro com movimentação de peões entre servidores.
* `src/components/CardView.tsx` (141 linhas) — Componente de carta v1.0 substituído pelas cartas do tabuleiro.
* `src/components/GameBoard.tsx` (162 linhas) — Tabuleiro do jogo v1.0 substituído por `BoardGameMain`.
* `src/components/Hand.tsx` (102 linhas) — Mão de cartas antiga substituída por `BoardHand.tsx`.
* `src/components/Header.tsx` (112 linhas) — Cabeçalho v1.0 com botão de terminal.
* `src/components/PatchModal.tsx` (116 linhas) — Modal v1.0 substituído pelo sistema de dados de `DiceRoller.tsx`.
* `src/components/ProgramSelectorModal.tsx` (95 linhas) — Modal de programas substituído pelo Program Market direto no tapete central.
* `src/components/RulebookHelpModal.tsx` (98 linhas) — Modal v1.0 substituído pelo link direto do manual oficial em HTML.
* `src/components/TerminalLog.tsx` (88 linhas) — Componente de log de terminal do jogo v1.0.

#### Contextos, Regras e Módulos Descontinuados
* `src/context/GameContext.tsx` (367 linhas) — Contexto v1.0 substituído integralmente por `BoardGameContext.tsx`.
* `src/utils/gameRules.ts` (33 linhas) — Regras v1.0 de zonas de saldo bruto; substituído por `gameRulesV14.ts`.
* `src/data/boardData.ts` (135 linhas) — Dados de servidores e nós (`SERVERS_DATA`, `ALL_BOARD_NODES`) que só serviam ao `BoardMap`.
* `src/utils/multiplayerSync.ts` (98 linhas) — Protótipo de sincronização via BroadcastChannel/LocalStorage inativo; o multiplayer oficial opera exclusivamente via `supabaseSync.ts`.

---

### 2. Refatoração Cirúrgica em Arquivos Ativos de `src/`

#### A. Em `src/App.tsx`
* **Excluir:** Declaração do componente `CardGameContent` (linhas 14 a 107 = 94 linhas de código inerte).
* **Excluir:** Imports órfãos no topo:
  ```tsx
  import { GameProvider, useGame } from './context/GameContext';
  import { Header } from './components/Header';
  import { ArchetypeSelector } from './components/ArchetypeSelector';
  import { GameBoard } from './components/GameBoard';
  import { Hand } from './components/Hand';
  import { PatchModal } from './components/PatchModal';
  import { TerminalLog } from './components/TerminalLog';
  import { Trophy, RefreshCw, Layers } from 'lucide-react';
  import { soundFx } from './utils/audio';
  ```

#### B. Em `src/data/cardsData.ts`
* **Excluir:** Constante `MASTER_DECK` (linhas 609 a 953 = 345 linhas de cartas legadas que só eram importadas pelo `GameContext.tsx` descontinuado).
* **Excluir:** Tipos e interfaces não utilizados: `CardType`, `VulnerabilityClass`, `SeverityLevel`, `Card`.

#### C. Em `src/context/BoardGameContext.tsx`
* **Excluir:** `import { mpSync } from '../utils/multiplayerSync';` (linha 21).
* **Excluir:** Chamada zumbi na linha 1454: `mpSync.sendAction('END_TURN', syncPayload);`.
* **Excluir:** Estados e mutadores herdados do protótipo de peões/mapa:
  `playerNodeId`, `movePawn`, `servers`, `bots`, `isSetupWizardOpen`, `completeSetup`, `logs`.
* **Excluir:** Métodos declarados na interface mas nunca invocados por componentes:
  `activateCveProtection`, `addAlertaToken`, `addReputacaoToken`, `removeAlertaToken`, `setGameWinner`, `programDeckCount`.

#### D. Em `vite.config.ts`
* **Remover:** Entrada duplicada de build `game: 'game.html'` no `rollupOptions.input`.

---

### 3. Arquivos Órfãos na Raiz do Projeto (55 arquivos)

#### Entry Point Duplicado
* `game.html` — Cópia redundante de `index.html`.

#### Scripts Node.js / CommonJS de Migrações Antigas (8 arquivos)
* `audit_diff.cjs`
* `convert.cjs`
* `fix_icons.cjs`
* `gen_table.cjs`
* `phase_b_cards.cjs`
* `phase_b_events.cjs`
* `phase_b_update.cjs`
* `update_archetypes.cjs`

#### Scripts Python de Tradução e Conversão Antigas (9 arquivos)
* `add_pt_desc.py`
* `convert_all.py`
* `final_fix.py`
* `find_contexts.py`
* `fix_translation.py`
* `fix_translation2.py`
* `script.py`
* `update_manual.py`
* `validate.py`

#### Scripts TypeScript Soltos na Raiz (9 arquivos)
* `audit.ts`
* `audit_collisions.ts`
* `audit_names.ts`
* `extract.ts`
* `extract_pnp.ts`
* `extract_pnp_reduzida.ts`
* `extract_pnp_txt.ts`
* `extract_pnp_vulnerabilidades.ts`
* `update_cards.ts`

#### Arquivos JSON de Diff e Temporários (7 arquivos)
* `diff_actions.json`
* `diff_archetypes.json`
* `diff_events.json`
* `diff_programs.json`
* `diff_vulns.json`
* `temp_events.json`
* `vulnerabilidades_pnp_fisico.json`

#### Dumps de Texto Bruto e Análises Antigas (8 arquivos)
* `analise_textual_cartas.txt`
* `analise_textual_cartas_completa.txt`
* `analise_textual_pnp.txt`
* `analise_textual_pnp_reduzida.txt`
* `golpe19.txt`
* `index.txt`
* `output.txt`
* `pwnd-manual.txt`

#### Manuais e Folhas HTML Obsoletas na Raiz (10 arquivos)
*(Nota: O manual oficial mantido em produção reside em `public/pwned-manual-sucesso-v1.html`)*
* `a4-bounty-track6.html`
* `a4-central-mat.html`
* `pwnd-guia-bolso.html`
* `pwnd-manual-v1.2.html`
* `pwnd-manual-v1.3.html`
* `pwnd-pnp-deluxe-sample.html`
* `pwnd-quickrules-booklet.html`
* `pwned-manual-b2b-v1.html`
* `pwned-manual-sucesso-v1.html` *(cópia da raiz)*
* `quick-rules-v1.3.html`

#### Relatórios e Changelogs Antigos (3 arquivos)
* `audit_report.md`
* `design_changelog_v1.md`
* `Protocolo do Playtest.md`

---

### 4. Arquivos Órfãos na pasta `public/` (Inchaço do Build)
Tudo em `public/` é copiado integralmente pelo Vite para a pasta de distribuição `dist/`. Os itens abaixo não são utilizados em tempo de execução:

#### Manuais Obsoletos Copiados para o Bundle Final (5 arquivos)
* `public/pwnd-manual-v1.2.html`
* `public/pwnd-manual-v1.3.html`
* `public/pwnd-manual.html`
* `public/pwnd-quickrules-booklet.html`
* `public/pwned-manual-b2b-v1.html`

#### Imagens não Referenciadas no Código (6 arquivos)
* `public/images/player_mat_base.jpg`
* `public/cards-back/back-archetypes.jpg`
* `public/cards-back/back-events.jpg`
* `public/cards-back/back-programs.jpg`
* `public/cards-back/back-tools.jpg`
* `public/cards-back/back-vulnerabilidades.jpg`

---

### 5. Diretórios Auxiliares
* `_archive/` (8 arquivos) e `scratch/` (71 arquivos): Histórico antigo de desenvolvimento e automação; devem ser descartados ou movidos para fora do repositório da aplicação web.
* `photoshop_data/` (17 arquivos) e `Screentop/` (15 arquivos): Planilhas e CSVs de geração gráfica para o jogo físico e Screentop.gg. Não afetam a aplicação web desde que mantidos isolados, mas podem ser arquivados em pasta de design externa.

---