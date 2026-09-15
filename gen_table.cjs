const fs=require('fs');
const txt=fs.readFileSync('src/data/full24EventsData.ts','utf8');
let t='| ID | Nome | Ícone | ptDescription (OK) |\n|---|---|---|---|\n';
const matches=[...txt.matchAll(/id:\s*'evt-(\d{2})'[\s\S]*?name:\s*'([^']+)'[\s\S]*?icon:\s*'([^']+)'[\s\S]*?ptDescription:\s*'([^']+)'/g)];
for(let m of matches){
    t += `| evt-${m[1]} | ${m[2]} | ${m[3]} | ✅ (OK) |\n`;
}
console.log(t);
