const fs=require('fs'),path=require('path');
const seen=new Set();const ex=['','.ts','.tsx','/index.ts','/index.tsx'];
function res(f,s){const b=path.resolve(path.dirname(f),s);for(const e of ex){const p=b+e;if(fs.existsSync(p)&&fs.statSync(p).isFile())return p}return null}
function walk(f){if(seen.has(f))return;seen.add(f);if(!/\.tsx?$/.test(f))return;const t=fs.readFileSync(f,'utf8');
const re=/(?:from\s*|import\s*\(\s*|import\s+|require\(\s*)['"](\.[^'"]+)['"]/g;let m;while(m=re.exec(t)){const r=res(f,m[1]);if(r)walk(r)}}
walk(path.resolve('src/main.tsx'));
const reach=[...seen].map(p=>path.relative('.',p).replace(/\\/g,'/')).sort();
fs.writeFileSync('scratch/reachable.txt',reach.join('\n'));
const all=[];(function d(x){for(const n of fs.readdirSync(x)){const p=path.join(x,n);fs.statSync(p).isDirectory()?d(p):all.push(p.replace(/\\/g,'/'))}})('src');
const rep=fs.readFileSync('AUDITORIA_LIMPEZA_CODIGO.md','utf8').split('\n');
const iO=rep.findIndex(l=>l.includes('LEGADO / CÓDIGO MORTO'));
const base=a=>a.map(f=>path.basename(f));
const act=new Set(),orf=new Set();
rep.forEach((l,i)=>{const ms=[...l.matchAll(/`([^`]+\.(?:tsx?|css))`/g)].map(m=>path.basename(m[1]));
 if(i<iO)ms.forEach(x=>act.add(x));else if(i<121)ms.forEach(x=>orf.add(x))});
for(const f of all){const b=path.basename(f),r=seen.has(path.resolve(f));
 const say=act.has(b)?'ATIVO':orf.has(b)?'ÓRFÃO':'(não citado)';
 if((r&&say!=='ATIVO')||(!r&&say!=='ÓRFÃO'))console.log(f,'|',say,'|',r?'alcançável':'inalcançável')}
