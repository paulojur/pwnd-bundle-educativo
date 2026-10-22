/**
 * gameRules.ts
 * PWND! Board Game - Regras Oficiais de Jogo e Constantes Compartilhadas
 * 
 * FONTE ÚNICA DE VERDADE:
 * Zona, cor e penalidade de patch são SEMPRE determinadas pelo SALDO BRUTO (bounty total)
 * do pesquisador, e NUNCA pelo degrau ocupado pelo marcador na Bounty Track.
 * 
 * Limiares das Zonas (Régua de 28 degraus):
 * - Zona Verde: <= $11.000
 * - Zona Amarela: > $11.000 e <= $20.000
 * - Zona Laranja: > $20.000 e <= $33.000
 * - Zona Vermelha: > $33.000
 */

export interface ZoneInfo {
  name: string;
  cssColor: string;
  patchPenalty: number;
}

export function getZoneByBalance(balance: number): ZoneInfo {
  if (balance > 33000) {
    return { name: 'Vermelha', cssColor: 'var(--alert-red)', patchPenalty: 6000 };
  } else if (balance > 20000) {
    return { name: 'Laranja', cssColor: '#f97316', patchPenalty: 4500 };
  } else if (balance > 11000) {
    return { name: 'Amarela', cssColor: 'var(--amber-glow)', patchPenalty: 3000 };
  } else {
    // Verde (<= 11000)
    return { name: 'Verde', cssColor: 'var(--terminal-green)', patchPenalty: 1500 };
  }
}
