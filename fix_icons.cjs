const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'data', 'full24EventsData.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix evt-11 icon
content = content.replace(
  /name:\s*'WAF Deployed!',\n\s*technicalReference:\s*'Web Application Firewall Block',\n\s*icon:\s*'🏅'/,
  "name: 'WAF Deployed!',\n    technicalReference: 'Web Application Firewall Block',\n    icon: '🛡️'"
);

// 2. Fix parked ids and descriptions
// First parked: License Expired!
content = content.replace(
  /id:\s*'evt-04',\n\s*number:\s*'04',\n\s*name:\s*'License Expired!'/,
  "id: 'evt-parked-01',\n    number: '04',\n    name: 'License Expired!'"
);

// Second parked: Patch Tuesday!
content = content.replace(
  /id:\s*'evt-18',\n\s*number:\s*'18',\n\s*name:\s*'Patch Tuesday!'/,
  "id: 'evt-parked-02',\n    number: '18',\n    name: 'Patch Tuesday!'"
);

// Fix "em teus Racks" -> "em seus Racks" for parked-02 ptDescription
// It's the only occurrence of "teus Racks" in Patch Tuesday, but let's be safe:
content = content.replace(
  /ptDescription:\s*'Dia mundial de correções corporativas! Todos os jogadores removem 1 carga de todas as Tools instaladas em teus Racks\.'/,
  "ptDescription: 'Dia mundial de correções corporativas! Todos os jogadores removem 1 carga de todas as Tools instaladas em seus Racks.'"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed icons and parked IDs!');
