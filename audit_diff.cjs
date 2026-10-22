const fs = require('fs');

// 1. CARREGAR FONTES DA VERDADE
const truthVulns = JSON.parse(fs.readFileSync('vulnerabilidades_pnp_fisico.json', 'utf8'));
const truthTxt = fs.readFileSync('analise_textual_pnp_reduzida.txt', 'utf8');

// 2. CARREGAR DADOS DO PNP ATUAL
const full80Code = fs.readFileSync('src/data/full80DeckData.ts', 'utf8');
const cardsDataCode = fs.readFileSync('src/data/cardsData.ts', 'utf8');
const eventsCode = fs.readFileSync('src/data/full24EventsData.ts', 'utf8');

console.log('=== AUDITORIA DE COMPREENSÃO & DIFF COMPLETO ===\n');

// -------------------------------------------------------------
// SEÇÃO A: VULNERABILIDADES (truth: vulnerabilidades_pnp_fisico.json vs src/data/full80DeckData.ts)
// -------------------------------------------------------------
console.log('### SEÇÃO A: VULNERABILIDADES (80 CARTAS)\n');

const vulnDiffs = [];
for (const v of truthVulns) {
  // Regex para encontrar a carta no full80DeckData.ts
  const cardBlockRegex = new RegExp(`id:\\s*['"]${v.id}['"][\\s\\S]*?(?=\\}|id:)`);
  const match = full80Code.match(cardBlockRegex);
  
  if (!match) {
    vulnDiffs.push({ id: v.id, name: v.name, issue: 'CARTA_NAO_ENCONTRADA_NO_CODIGO' });
    continue;
  }
  
  const block = match[0];
  const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
  const techMatch = block.match(/technicalReference:\s*['"]([^'"]+)['"]/);
  const descMatch = block.match(/simpleDescription:\s*['"]([^'"]+)['"]/);
  const ptDescMatch = block.match(/ptDescription:\s*['"]([^'"]+)['"]/);
  const rarityMatch = block.match(/rarity:\s*['"]([^'"]+)['"]/);
  
  const pnpName = nameMatch ? nameMatch[1] : '';
  const pnpTech = techMatch ? techMatch[1] : '';
  const pnpDesc = descMatch ? descMatch[1] : '';
  const pnpPtDesc = ptDescMatch ? ptDescMatch[1] : '';
  const pnpRarity = rarityMatch ? rarityMatch[1] : '';
  
  const diffs = {};
  if (pnpName !== v.name) diffs.name = { truth: v.name, pnp: pnpName };
  if (pnpTech !== v.technicalReference) diffs.technicalReference = { truth: v.technicalReference, pnp: pnpTech };
  if (pnpRarity !== v.rarity) diffs.rarity = { truth: v.rarity, pnp: pnpRarity };
  if (pnpDesc.trim() !== v.description.trim()) diffs.description = { truth: v.description, pnp: pnpDesc };
  if (v.ptDescription && pnpPtDesc && pnpPtDesc.trim() !== v.ptDescription.trim()) diffs.ptDescription = { truth: v.ptDescription, pnp: pnpPtDesc };
  
  if (Object.keys(diffs).length > 0) {
    vulnDiffs.push({ id: v.id, name: v.name, diffs });
  }
}

console.log(`Total de vulnerabilidades com discrepâncias: ${vulnDiffs.length} de 80`);
fs.writeFileSync('diff_vulns.json', JSON.stringify(vulnDiffs, null, 2));

// -------------------------------------------------------------
// SEÇÃO B: TOOLS E DEFUSES (truth: analise_textual_pnp_reduzida.txt vs src/data/full80DeckData.ts)
// -------------------------------------------------------------
console.log('\n### SEÇÃO B: TOOLS E DEFUSES (CARTAS DE AÇÃO)\n');

// Parse analise_textual_pnp_reduzida.txt para tools/defuses
const toolCardsSection = truthTxt.split('==================================================')[2] || '';
const cardEntries = truthTxt.match(/\[ID:\s*([^\]]+)\]\s*([^\n\r]+)[\s\S]*?--------------------------------------------------/g) || [];

const actionDiffs = [];
for (const entry of cardEntries) {
  const idMatch = entry.match(/\[ID:\s*([^\]]+)\]/);
  if (!idMatch) continue;
  const id = idMatch[1].trim();
  
  // Ignora se for program, archetype, event
  if (id.startsWith('shopall') || id.startsWith('banksafe') || id.startsWith('govportal') || 
      id.startsWith('healthlock') || id.startsWith('cloudnine') || id.startsWith('socialbee') ||
      id.startsWith('gameverse') || id.startsWith('educonnect') || id.startsWith('cryptox') ||
      id.startsWith('aicore') || id.startsWith('paygateway') || id.startsWith('deliverydash') ||
      id === 'n00b' || id === 'old-guard' || id === 'bug-hunter' || id === 'social-engineer' ||
      id === 'red-teamer' || id === 'pentester' || id.startsWith('evt-')) {
    continue;
  }
  
  const nameMatch = entry.match(/\[ID:\s*[^\]]+\]\s*([^\(\n\r]+)/);
  const techMatch = entry.match(/Nome Técnico:\s*([^\n\r]+)/);
  const descMatch = entry.match(/\[pt-BR\] Descrição:\s*([\s\S]*?)(?=\[pt-PT\]|--------------------------------------------------)/);
  
  const truthName = nameMatch ? nameMatch[1].trim() : '';
  const truthTech = techMatch ? techMatch[1].trim() : '';
  const truthDesc = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  // Buscar no código src/data/full80DeckData.ts
  const codeBlockRegex = new RegExp(`id:\\s*['"]${id}['"][\\s\\S]*?(?=\\}|id:)`);
  const match = full80Code.match(codeBlockRegex);
  
  if (!match) {
    actionDiffs.push({ id, issue: 'NAO_ENCONTRADO_NO_CODIGO' });
    continue;
  }
  
  const block = match[0];
  const cNameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
  const cTechMatch = block.match(/technicalReference:\s*['"]([^'"]+)['"]/);
  const cDescMatch = block.match(/simpleDescription:\s*['"]([^'"]+)['"]/);
  
  const cName = cNameMatch ? cNameMatch[1].trim() : '';
  const cTech = cTechMatch ? cTechMatch[1].trim() : '';
  const cDesc = cDescMatch ? cDescMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  const diffs = {};
  if (truthName && cName !== truthName) diffs.name = { truth: truthName, pnp: cName };
  if (truthTech && cTech !== truthTech) diffs.technicalReference = { truth: truthTech, pnp: cTech };
  if (truthDesc && cDesc !== truthDesc) diffs.description = { truth: truthDesc, pnp: cDesc };
  
  if (Object.keys(diffs).length > 0) {
    actionDiffs.push({ id, diffs });
  }
}

console.log(`Total de Tools/Defuses com discrepâncias: ${actionDiffs.length}`);
fs.writeFileSync('diff_actions.json', JSON.stringify(actionDiffs, null, 2));

// -------------------------------------------------------------
// SEÇÃO C: PROGRAMAS (truth: analise_textual_pnp_reduzida.txt vs src/data/cardsData.ts)
// -------------------------------------------------------------
console.log('\n### SEÇÃO C: PROGRAMAS\n');
const programDiffs = [];
for (const entry of cardEntries) {
  const idMatch = entry.match(/\[ID:\s*([^\]]+)\]/);
  if (!idMatch) continue;
  const id = idMatch[1].trim();
  if (!id.match(/^(shopall|banksafe|govportal|healthlock|cloudnine|socialbee|gameverse|educonnect|cryptox|aicore|paygateway|deliverydash)/)) {
    continue;
  }
  
  const descMatch = entry.match(/\[pt-BR\] Descrição:\s*([\s\S]*?)(?=\[pt-PT\]|--------------------------------------------------)/);
  const truthDesc = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  const codeBlockRegex = new RegExp(`id:\\s*['"]${id}['"][\\s\\S]*?(?=\\}|id:)`);
  const match = cardsDataCode.match(codeBlockRegex);
  if (!match) {
    programDiffs.push({ id, issue: 'NAO_ENCONTRADO_NO_CODIGO' });
    continue;
  }
  const block = match[0];
  const cDescMatch = block.match(/description:\s*['"]([^'"]+)['"]/);
  const cDesc = cDescMatch ? cDescMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  if (truthDesc && cDesc !== truthDesc) {
    programDiffs.push({ id, description: { truth: truthDesc, pnp: cDesc } });
  }
}
console.log(`Total de Programas com discrepâncias: ${programDiffs.length}`);
fs.writeFileSync('diff_programs.json', JSON.stringify(programDiffs, null, 2));

// -------------------------------------------------------------
// SEÇÃO D: ARQUÉTIPOS (truth: analise_textual_pnp_reduzida.txt vs src/data/cardsData.ts)
// -------------------------------------------------------------
console.log('\n### SEÇÃO D: ARQUÉTIPOS\n');
const archetypeDiffs = [];
const archIds = ['n00b', 'old-guard', 'bug-hunter', 'social-engineer', 'red-teamer', 'pentester'];
for (const entry of cardEntries) {
  const idMatch = entry.match(/\[ID:\s*([^\]]+)\]/);
  if (!idMatch) continue;
  const id = idMatch[1].trim();
  if (!archIds.includes(id)) continue;
  
  const playstyleMatch = entry.match(/\[pt-BR\] Estilo:\s*([\s\S]*?)(?=\[pt-PT\]|--------------------------------------------------|\[pt-BR\] Meus Poderes)/);
  const truthPlaystyle = playstyleMatch ? playstyleMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  const codeBlockRegex = new RegExp(`id:\\s*['"]${id}['"][\\s\\S]*?(?=\\}|id:)`);
  const match = cardsDataCode.match(codeBlockRegex);
  if (!match) {
    archetypeDiffs.push({ id, issue: 'NAO_ENCONTRADO_NO_CODIGO' });
    continue;
  }
  const block = match[0];
  const cPlayMatch = block.match(/playstyle:\s*['"`]([\s\S]*?)['"`],/);
  const cPlay = cPlayMatch ? cPlayMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  if (truthPlaystyle && cPlay !== truthPlaystyle) {
    archetypeDiffs.push({ id, playstyle: { truth: truthPlaystyle, pnp: cPlay } });
  }
}
console.log(`Total de Arquétipos com discrepâncias: ${archetypeDiffs.length}`);
fs.writeFileSync('diff_archetypes.json', JSON.stringify(archetypeDiffs, null, 2));

// -------------------------------------------------------------
// SEÇÃO E: EVENTOS (truth: analise_textual_pnp_reduzida.txt vs src/data/full24EventsData.ts)
// -------------------------------------------------------------
console.log('\n### SEÇÃO E: EVENTOS\n');
const eventDiffs = [];
for (const entry of cardEntries) {
  const idMatch = entry.match(/\[ID:\s*([^\]]+)\]/);
  if (!idMatch) continue;
  const id = idMatch[1].trim();
  if (!id.startsWith('evt-')) continue;
  
  const descMatch = entry.match(/\[pt-BR\] Descrição:\s*([\s\S]*?)(?=\[pt-PT\]|--------------------------------------------------)/);
  const truthDesc = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  const codeBlockRegex = new RegExp(`id:\\s*['"]${id}['"][\\s\\S]*?(?=\\}|id:)`);
  const match = eventsCode.match(codeBlockRegex);
  if (!match) {
    eventDiffs.push({ id, issue: 'NAO_ENCONTRADO_NO_CODIGO' });
    continue;
  }
  const block = match[0];
  const cDescMatch = block.match(/simpleDescription:\s*['"]([^'"]+)['"]/);
  const cDesc = cDescMatch ? cDescMatch[1].replace(/\s+/g, ' ').trim() : '';
  
  if (truthDesc && cDesc !== truthDesc) {
    eventDiffs.push({ id, description: { truth: truthDesc, pnp: cDesc } });
  }
}
console.log(`Total de Eventos com discrepâncias: ${eventDiffs.length}`);
fs.writeFileSync('diff_events.json', JSON.stringify(eventDiffs, null, 2));

console.log('\n=== AUDITORIA CONCLUÍDA! ===');
