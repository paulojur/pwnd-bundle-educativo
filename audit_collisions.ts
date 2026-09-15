import { ALL_ACTION_CARDS } from './src/data/full80DeckData';
import { PROGRAM_CARDS, ARCHETYPES } from './src/data/cardsData';
import { FULL_23_EVENTS } from './src/data/full23EventsData';

const names = new Map<string, string>(); // name -> category
let collisions = 0;

function check(list: {name: string}[], category: string) {
  for (const item of list) {
    const n = item.name.trim().toLowerCase();
    if (names.has(n)) {
      console.log(`[COLLISION] "${item.name}" found in ${category} and ${names.get(n)}`);
      collisions++;
    } else {
      names.set(n, category);
    }
  }
}

const exploits = ALL_ACTION_CARDS.filter(c => c.type === 'exploit');
const tools = ALL_ACTION_CARDS.filter(c => c.type === 'tool');
const defuses = ALL_ACTION_CARDS.filter(c => c.type === 'defuse');

check(exploits, 'Vulnerabilidades');
check(tools, 'Tools');
check(defuses, 'Safeguards');
check(PROGRAM_CARDS, 'Program Cards');
check(FULL_23_EVENTS, 'Event Cards');
check(ARCHETYPES, 'Archetypes');

if (collisions === 0) {
  console.log('Zero colisões encontradas entre as categorias.');
}

