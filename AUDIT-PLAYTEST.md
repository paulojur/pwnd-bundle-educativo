# 🔍 AUDIT-PLAYTEST.md — Auditoria Técnica & de Game Design (Playtest 11/11/2026)

- **Relatório Bruto de Origem**: [pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md) *(122 eventos cronológicos auditados)*
- **Formato da Partida**: 2 Jogadores (`paulo [Verde - Bug Hunter]` vs. `joao [Azul - The Old Guard]`) • 8 Rodadas
- **Resultado Final**: 🥇 `joao (Azul)` **$21.500** vs. 🥈 `paulo (Verde)` **$5.500**

---

## 1. Resumo Executivo da Auditoria

A análise cruzada dos **122 eventos** em [pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md) confirmou que a sincronização multiplayer em tempo real (`AUDIT_LOG`, `METRIC_UPDATE` e baralhos compartilhados) funcionou integralmente do início ao fim.

Além disso, a inspeção linha por linha revelou **2 bugs reais no motor de escopo** ([`checkCardScopeV14`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/utils/gameRulesV14.ts#L140-L294)), **1 falha de limpeza no log de `[SETUP]`**, e **5 pontos estruturais de Game Design e Balanceamento** que explicam tanto a dificuldade de atingir $40.000 em 8 rodadas quanto a sensação punitiva dos *Patches* e *Alertas*.

---

## 2. Achados Técnicos (Bugs Confirmados no Motor de Jogo)

### 2.1. Bug Crítico de Substring na Validação de Escopo (`checkCardScopeV14`)
- **Evidências no Log**:
  - **Evento #48** ([pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md#L209-L212)): `joao` baixou `Perfect Storm` (classe **`APT`**) no programa `DeliveryDash App` (cujo escopo real em [`canonicalV14Data.ts`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/data/canonicalV14Data.ts#L2030-L2045) é apenas `LOGIC, BAC, SSRF`), e o sistema validou como `🎯 NO ESCOPO [APT]`.
  - **Evento #3** ([pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md#L29-L32)): `paulo` baixou `Cracked Mask` (classe **`XSS`**) no programa `Voltz PowerGrid` (cujo escopo real é apenas `INJ, BAC`), e o sistema validou como `🎯 NO ESCOPO [XSS]`.
- **Causa Raiz no Código**:
  Em [`src/utils/gameRulesV14.ts`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/utils/gameRulesV14.ts#L272-L278):
  ```ts
  const cardRef = (card.technicalReference || card.name).toLowerCase();
  const isClassMatch = Array.isArray(allowed) && allowed.some(cat => {
    const catUpper = String(cat).toUpperCase();
    if (cardClass && catUpper === cardClass) return true;
    const catLower = String(cat).toLowerCase();
    return cardRef.includes(catLower) || catLower.includes(cardRef);
  });
  ```
  Como `cardRef.includes(catLower)` busca a sigla da classe dentro do subtítulo técnico em inglês (`technicalReference`):
  - `Perfect Storm` (`APT`) tem `technicalReference = "SSRF to Internal Admin Chain"`, que contém a substring `"ssrf"` — enganando o filtro do `DeliveryDash App` (`LOGIC, BAC, SSRF`).
  - `Cracked Mask` (`XSS`) tem `technicalReference = "Attribute Injection XSS"`, que contém a substring `"inj"` — enganando o filtro do `Voltz PowerGrid` (`INJ, BAC`).
  - O mesmo falso-positivo afeta outras 4 cartas do baralho: `Eye Trick` (`XSS`, `"HTML Injection"` -> `"inj"`), `Next Door` (`BAC`, `"Broken Object Level Auth (BOLA)"` -> `"auth"`), `Service Lift` (`BAC`, `"Broken Function Level Auth"` -> `"auth"`) e `Free Gate` (`BAC`, `"Global Authorization Bypass"` -> `"auth"`).
- **Correção Planejada**: Remover completamente o fallback por substring (`cardRef.includes(catLower)`) e comparar estritamente `catUpper === cardClass`.

---

### 2.2. Inversão na Ordem de Precedência do Escopo (`PayGateway Prime` vs. `Endpoint Lab`)
- **Evidência no Log**:
  - **Eventos #117 e #118** ([pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md#L485-L492)): `joao` estava com o programa `PayGateway Prime`, cujo escopo nativo em [`canonicalV14Data.ts`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/data/canonicalV14Data.ts#L2221-L2236) é **`BAC, AUTH, INJ`**. Ao descer `Next Door` (classe `BAC`), o sistema registrou `🚀 ENDPOINT LAB [BAC LIBERADO] — baixou [Next Door] fora do escopo original de [PayGateway Prime]`.
  - **Evento #107** ([pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md#L445-L448)): `joao` baixou `Keychain` (`BAC`) no mesmo `PayGateway Prime` (`BAC, AUTH, INJ`) e o sistema rotulou como `🃏 CORINGA DE ESCOPO [BAC]` em vez de escopo nativo.
- **Causa Raiz no Código**:
  Em [`checkCardScopeV14`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/utils/gameRulesV14.ts#L207-L286), as verificações de **fura-escopo** (Passos 2 a 5: *Red Teamer*, *Scope Expansion*, *Coringa de Escopo* e *Endpoint/Injection Lab*) estão posicionadas **antes** da verificação do escopo nativo do Programa (Passos 6 e 7). Assim, se o jogador tiver `Endpoint Lab` instalado, qualquer carta `BAC` é rotulada como "fora do escopo original liberada pelo Endpoint Lab", mesmo quando o Programa já aceita `BAC` nativamente.
- **Correção Planejada**: Inverter a ordem em [`checkCardScopeV14`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/utils/gameRulesV14.ts) para checar **primeiro** se a classe pertence ao escopo nativo do programa (`ALL` ou `allowedClasses`), e acionar *Coringa de Escopo*, *Endpoint/Injection Lab*, *Scope Expansion* ou *Red Teamer* **somente quando a carta não estiver no escopo nativo**.

---

### 2.3. Duplicidade de Registro `[SETUP]` no Log de Auditoria
- **Evidência no Log**:
  - **Eventos #1 e #2** ([pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md#L21-L28)): Existem dois eventos `[SETUP]` com 5 segundos de diferença (`10:50:41` e `10:50:46`). O Evento #2 era o estado local descartado do navegador convidado antes de receber o setup oficial do Host (#1).
- **Causa Raiz no Código**:
  Ao inicializar o `BoardGameProvider` no navegador 2, um log local `init-setup-...` é criado na montagem; quando a partida online sincroniza ou reinicia, [`mergeAuditLogs`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/context/BoardGameContext.tsx#L236-L250) une os arrays mantendo o `SETUP` antigo junto com o oficial.
- **Correção Planejada**: Ao reiniciar a partida (`resetBoardGame` / `RESET_GAME`) ou ao sincronizar o estado da sala (`STATE_SYNC` / `mergeAuditLogs`), substituir qualquer entrada anterior de categoria `SETUP` para que exista **única e exclusivamente 1 registro `[SETUP]`** correspondente à partida real.

---

## 3. Diagnóstico de Game Design & Balanceamento

### 3.1. Ritmo de Pontuação: 8 Rodadas vs. 10 Rodadas (Meta de $40.000)
- **Matemática Observada**: Com 3 APs/turno e `Report = 2 AP`, um jogador completa em média 1 ciclo de *Recon + 2–3 Exploits + Report* a cada **2 rodadas**. Em 8 rodadas, isso representa 3 a 4 Reports tentados (e, com ~35%–41% de chance de Patch em 2D6, **2 a 3 Reports concluídos**), estacionando o vencedor ao redor de **$21.500–$27.000**.
- **Impacto de Subir para 10 Rodadas**: Adiciona **+1 ciclo completo de Report** (+6 APs por jogador), elevando o teto esperado de pontuação em +$7.000 a +$11.000 sem inflacionar artificialmente os valores das cartas, com acréscimo estimado de apenas ~10–12 minutos na partida.

### 3.2. Lógica Sistêmica dos Tokens de Alerta (`🐞`) — Patch Aceito vs. Bypass
- **Problema Identificado**: Sofrer um `Patch Deployed` (sem Bypass) já impõe **tripla punição**: perda de todos os exploits da mesa + perda do programa ativo + perda dos APs investidos. Quando o jogador já possui `1🐞`, adicionar o `2🐞` no Patch Aceito e cobrar **-$2.000** na Bounty Track pune duplamente quem já perdeu a jogada (como ocorreu com `paulo` nos Eventos #43 e #44).
- **Diferença Estrutural entre "Aceitar o Patch" e "Usar Bypass"**:
  1. **Aceitar o Patch (Falha na Invasão)**: O jogador **não fatura nada** e perde a mesa. Se ele tiver `0🐞`, sobe para `1🐞`. Se ele **já tiver `1🐞`**, ele **não recebe o 2º token** (permanece em `1🐞`, sem multa de -$2.000), pois o próprio colapso da operação já é a penalidade máxima.
  2. **Usar `Bypass` (Forçar o Exploit / Report passando por cima do WAF/Blue Team)**: Aqui a lógica se inverte. Ao usar o `Bypass`, o jogador **salva todos os seus exploits** e **recebe o pagamento integral do Report** (ex: `joao` nos Eventos #63–#65 pagou -$2.000 de multa ao atingir `2🐞` no Bypass, mas embolsou **+$9.000** imediatamente no Report, lucrando +$7.000 líquidos!). Se o `Bypass` também fosse isento da multa de `2🐞` quando o jogador já tem `1🐞`, não haveria custo de risco para forçar um Report barulhento estando sob alerta. Portanto:
     - **Patch Aceito com `1🐞`**: Permanece em `1🐞` (não dispara a multa de -$2.000).
     - **Bypass Ativado (ou efeito de carta/evento) com `1🐞`**: Adiciona `+1🐞` normalmente, atinge `2🐞`, **paga a multa de -$2.000** e zera os tokens (`0/2`) — transformando o uso do Bypass com `1🐞` em uma decisão tática de *custo-benefício* consciente.

### 3.3. Abuso da Reciclagem 2:1 Gratuita (0 AP)
- **Evidência no Log**: Na Rodada 7 (**Eventos #95, #96 e #97**, [pwnd_relatorio_2026-11-11-11-01.md](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md#L397-L408)), `paulo` executou 3 reciclagens consecutivas por 0 AP no mesmo turno, convertendo 6 cartas da mão para garimpar exatamente a classe que precisava antes de usar seus APs.
- **Correção Planejada**: Limitar a **Reciclagem 2:1 (0 AP)** a **no máximo 1 vez por turno** (`recycledThisTurn`), alinhando-a com a regra de instalação de *Tool Cards* (1x/turno).

### 3.4. Eventos Instantâneos Sem Alvo Elegível ("No-Op")
- **Evidências no Log**:
  - **Evento #7 (`Public Disclosure!`)**: Sacado na Rodada 1 após o Report; como o próprio Report acabou de limpar a mesa do autor e o oponente ainda não havia jogado, resultou em *"Nenhuma vulnerabilidade estava exposta na mesa"* (efeito zero).
  - Outros eventos que frequentemente viram *no-op* quando a mesa está limpa: `Duplicate Report!` (`evt-02`), `Bug Collision!` (`evt-16`), `Blue Team Hunt!` (`evt-01`), `Responsible Disclosure!` (`evt-13`) e `Zero Day Disclosure` (`evt-07`, quando não há Tools no descarte).
- **Correção Planejada**: Implementar regra de **Conversão de Alvo Inexistente (Fallback de Evento)**: quando um Evento instantâneo não encontra nenhum alvo elegível na mesa, ele não passa em branco (converte-se em compra de +1 carta do Main Deck para o autor do Report ou permite recompra/efeito secundário).

### 3.5. O Caso do Programa `GovPortal Legacy` ("Carta Morta")
- **Evidência nos Dados**: Em [`Screentop/TSV/programas_36.tsv`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/Screentop/TSV/programas_36.tsv#L9-L12) e [`canonicalV14Data.ts`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/data/canonicalV14Data.ts#L1808-L1898), temos 3 programas de velocidade **Lenta (10-12)** e bônus **+$0**:
  1. `EduConnect LMS`: Escopo **`ALL` (8 classes)** | Patch `Lenta (10+)` | Bônus **`+$0`**
  2. `Voltz PowerGrid`: Escopo **`INJ, BAC` (2 classes)** | Patch `Lenta (10+)` | Bônus **`+$0`**
  3. `GovPortal Legacy`: Escopo **`BAC` (1 única classe!)** | Patch `Lenta (10+)` | Bônus **`+$0`**
- **Diagnóstico**: `GovPortal Legacy` é estritamente inferior a `Voltz PowerGrid` e `EduConnect LMS` em todos os eixos matemáticos (mesma velocidade 10+, mesmo bônus $0, porém aceita apenas 1 das 8 classes do baralho — apenas 14 cartas em 80). No próprio playtest (**Evento #9**), a primeira reação do jogador foi descartá-lo do Market.

---

## 4. Registro Oficial de Alterações Aplicadas (Baseline Pós-Auditoria)

Abaixo estão documentadas todas as alterações aprovadas e implementadas após a auditoria do relatório [`pwnd_relatorio_2026-11-11-11-01.md`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/pwnd_relatorio_2026-11-11-11-01.md), servindo de **baseline de comparação** para os próximos playtests:

| # | Escopo / Regra | Estado no Playtest #1 (Baseline Antiga) | Novo Estado Implementado (Baseline Atual) | Arquivos Alterados |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Duração da Partida** | **8 Rodadas** fixas (insuficiente para atingir a meta de `$40k` sem combos extremos). | **10 Rodadas** fixas (ou vitória imediata ao atingir `$40.000` na Bounty Track). | [`BoardGameContext.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/context/BoardGameContext.tsx), [`CenterMarketMat.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/components/CenterMarketMat.tsx), [`ObserverMetricsModal.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/components/ObserverMetricsModal.tsx), [`BoardGameMain.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/components/BoardGameMain.tsx), [`PlayerAidModal.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/components/PlayerAidModal.tsx) |
| **2** | **Tokens de Alerta (`🐞`) e Multa (`-$2k`)** | Aceitar um `Patch Deployed` sempre somava `+1🐞`, fazendo jogadores com `1🐞` perderem todas as vulns da mesa **e** ainda pagarem `-$2.000` de multa (`2/2🐞`). | **Piso Anti-Espiral no Patch Aceito**: Ao aceitar um Patch (`acceptPatch`), o jogador só recebe `+1🐞` se estiver com `0🐞` (teto de `1/2🐞`, sem multa de `-$2k`). Já ao **usar Bypass** (`defusePatch`) ou sofrer `🐞` de cartas/eventos, o token soma normalmente (`+1🐞`) e, ao atingir `2/2🐞`, aplica a multa de `-$2.000` e zera os tokens (`0/2`). | [`BoardGameContext.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/context/BoardGameContext.tsx), [`PlayerAidModal.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/components/PlayerAidModal.tsx) |
| **3** | **Unicidade do Log `[SETUP]`** | Múltiplos eventos `[SETUP]` apareciam no relatório (`#121` e `#122`) quando a sala inicializava localmente e depois era reiniciada no lobby. | Deduplicação canônica por chave (`0000000000000-init-setup`): qualquer novo setup ou reset substitui o `[SETUP]` anterior, garantindo **exatamente 1 registro `[SETUP]`** que reflete a partida real. (Programas duplicados no Market foram mantidos intencionalmente conforme design do baralho). | [`BoardGameContext.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/context/BoardGameContext.tsx) |
| **4** | **Validação Estrita de Escopo (`checkCardScopeV14`)** | 1) Substring match (`cardRef.includes(catLower)`) permitia que `Perfect Storm` (`APT`) entrasse como `SSRF` por ter `"SSRF"` no subtítulo técnico.<br>2) Poderes de bypass (`Coringa de Escopo`, `Endpoint Lab`, `Injection Lab`, `Red Teamer`) eram checados **antes** do escopo nativo do Programa, registrando logs enganosos e gastando cargas à toa. | 1) Removido `cardRef.includes(catLower)`: comparação estrita apenas por classe (`catUpper === cardClass`).<br>2) Escopo nativo do Programa (`ALL` ou `allowedClasses`) é validado **primeiro**; poderes/ferramentas de bypass só são consultados e consumidos quando a carta **não** pertence nativamente ao escopo do Programa. | [`gameRulesV14.ts`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/utils/gameRulesV14.ts) |
| **5** | **Limite da Reciclagem Tática 2:1 (0 AP)** | Ilimitada no turno (permitiu 3 reciclagens seguidas por 0 AP na Rodada 7, Eventos `#95–#97`). | Limitada a **1 vez por turno** (`recycledThisTurn`), com bloqueio de estado no contexto e feedback visual (`1x/turno`) na barra da mão. | [`BoardGameContext.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/context/BoardGameContext.tsx), [`BoardHand.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/components/BoardHand.tsx), [`PlayerAidModal.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/components/PlayerAidModal.tsx), [`pwned-manual-sucesso-v1.html`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/public/pwned-manual-sucesso-v1.html) |
| **6** | **Fallback de Eventos Sem Alvo na Mesa (Opção 6A)** | Eventos que miram vulnerabilidades expostas (`Blue Team Hunt!` `evt-01`, `Duplicate Report!` `evt-02`, `Public Disclosure!` `evt-09`, `Bug Collision!` `evt-16`) viravam *no-op* quando a mesa dos oponentes estava limpa. | Quando não há vulnerabilidades elegíveis na mesa, o(s) oponente(s) alvo(s) é(são) obrigado(s) a **descartar 1 carta aleatória da mão** (respeitando defesas como `CVE Protection`, `Pentester`, `Social Engineer` e `Interceptor Pro`). | [`BoardGameContext.tsx`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/context/BoardGameContext.tsx) |
| **7** | **Balanceamento de `GovPortal Legacy` (Opção 7A)** | Escopo restrito a `BAC` (1 classe), Patch `Lenta (10-12)` e Bônus `+$0` (estritamente inferior a `EduConnect LMS` e `Voltz PowerGrid`). | Mantido como alvo especialista em **`BAC`** com Patch **`Lenta (10-12)`**, porém com Bônus elevado para **`+$1.500`** (`1500`). | [`canonicalV14Data.ts`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/data/canonicalV14Data.ts), [`programas_36.tsv`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/Screentop/TSV/programas_36.tsv), [`cardsData.ts`](file:///f:/PWND%20Bundle%20Educativo%20-%20Copia/src/data/cardsData.ts) |


