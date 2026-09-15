const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'data', 'cardsData.ts');
let content = fs.readFileSync(file, 'utf8');

const newArchetypes = `export const ARCHETYPES: Archetype[] = [
  {
    id: 'n00b',
    name: 'n00b',
    title: 'O Iniciante Dedicado',
    ptTitle: 'O Iniciante Dedicado',
    playstyle: 'Garimpeiro de Ferramentas: após cada Report bem-sucedido, olha as 3 primeiras cartas do Main Deck e escolhe 1 Tool Card. Passiva instala na hora (rack cheio: descarta 1 Tool instalada para abrir vaga); ativa usa na hora, descartando após o uso. Não pode guardar para depois. Se não houver Tool, embaralha as 3 de volta.',
    ptPlaystyle: 'Garimpeiro de Ferramentas: após cada Report bem-sucedido, olha as 3 primeiras cartas do Main Deck e escolhe 1 Tool Card. Passiva instala na hora (rack cheio: descarta 1 Tool instalada para abrir vaga); ativa usa na hora, descartando após o uso. Não pode guardar para depois. Se não houver Tool, baralha as 3 de volta.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Garimpa 1 Tool por Report'],
    ptSpecialPowers: ['Garimpa 1 Tool por Report'],
    avatarIcon: '👾',
    color: '#39d353'
  },
  {
    id: 'old-guard',
    name: 'The Old Guard',
    title: 'O Veterano de C/ASM',
    ptTitle: 'O Veterano de C/ASM',
    playstyle: 'Mão Expandida',
    ptPlaystyle: 'Mão Expandida',
    maxHandSize: 9,
    reportsPerTurn: 1,
    bountyModifier: 1.2,
    specialPowers: ['+3 cartas de capacidade sobre os demais jogadores'],
    ptSpecialPowers: ['+3 cartas de capacidade sobre os demais jogadores'],
    avatarIcon: '🧙',
    color: '#c084fc'
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    title: 'O Caçador em Escala',
    ptTitle: 'O Caçador em Escala',
    playstyle: 'Caçador em Escala: só reporta vulnerabilidades Comum e Incomum (nunca Rara ou acima). Cada carta além da primeira no mesmo Report soma +$500 ao payout.',
    ptPlaystyle: 'Caçador em Escala: só reporta vulnerabilidades Comum e Incomum (nunca Rara ou acima). Cada carta além da primeira no mesmo Report soma +$500 ao payout.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Restrito a Comum e Incomum'],
    ptSpecialPowers: ['Restrito a Comum e Incomum'],
    avatarIcon: '🕷️',
    color: '#f0883e'
  },
  {
    id: 'social-engineer',
    name: 'Social Engineer',
    title: 'O Manipulador Social',
    ptTitle: 'O Manipulador Social',
    playstyle: 'Caos Redirecionado: na Recon, pode comprar 1 carta de Evento no lugar das 2 cartas. Qualquer evento que o mire pode ser redirecionado a outro jogador, exceto eventos de ajuda ao último colocado. A partir da Rodada 7, não compra mais eventos, mas segue redirecionando os que o miram.',
    ptPlaystyle: 'Caos Redirecionado: na Recon, pode comprar 1 carta de Evento no lugar das 2 cartas. Qualquer evento que o mire pode ser redirecionado a outro jogador, exceto eventos de ajuda ao último colocado. A partir da Ronda 7, não compra mais eventos, mas segue redirecionando os que o miram.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Redireciona cartas de evento', 'Alta interação PvP'],
    ptSpecialPowers: ['Redireciona cartas de evento', 'Alta interação PvP'],
    avatarIcon: '🎭',
    color: '#58a6ff'
  },
  {
    id: 'red-teamer',
    name: 'Red Teamer',
    title: 'O Operador Ofensivo',
    ptTitle: 'O Operador Ofensivo',
    playstyle: 'Sem Limites: Ignora todas as restrições de escopo dos programas, incluindo o evento Out of Scope! (paga -30% nos bounties obtidos). Só toma Patch tirando 8.',
    ptPlaystyle: 'Sem Limites: Ignora todas as restrições de escopo dos programas, incluindo o evento Out of Scope! (paga -30% nos bounties obtidos). Só toma Patch tirando 8.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 0.7,
    specialPowers: ['Ignora escopo de programas', 'Explora qualquer vulnerabilidade em qualquer alvo', 'Flexibilidade total'],
    ptSpecialPowers: ['Ignora escopo de programas', 'Explora qualquer vulnerabilidade em qualquer alvo', 'Flexibilidade total'],
    avatarIcon: '🥷🏽',
    color: '#f85149'
  },
  {
    id: 'pentester',
    name: 'The Pentester',
    title: 'O Auditor Metódico',
    ptTitle: 'O Auditor Metódico',
    playstyle: 'Imunidade Profissional: Imune a cartas de disrupção como Duplicate Report! e Triage Delay!. Só toma Patch tirando 8.',
    ptPlaystyle: 'Imunidade Profissional: Imune a cartas de disrupção como Duplicate Report! e Triage Delay!. Só toma Patch tirando 8.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Imunidade a Duplicate Report!', 'Imunidade a Triage Delay!', 'Fluxo estável de caixa'],
    ptSpecialPowers: ['Imunidade a Duplicate Report!', 'Imunidade a Triage Delay!', 'Fluxo estável de caixa'],
    avatarIcon: '📋',
    color: '#d2a8ff'
  }
];`;

content = content.replace(/export const ARCHETYPES: Archetype\[\] = \[[\s\S]*?\}\n\];/, newArchetypes);

fs.writeFileSync(file, content, 'utf8');
console.log('Archetypes updated successfully.');
