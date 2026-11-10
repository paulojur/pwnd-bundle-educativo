import re,os,sys
seen=set();EX=['','.ts','.tsx','/index.ts','/index.tsx']
def res(f,s):
    b=os.path.normpath(os.path.join(os.path.dirname(f),s))
    for e in EX:
        p=b+e
        if os.path.isfile(p):return p
def walk(f):
    if f in seen:return
    seen.add(f)
    if not re.search(r'\.tsx?$',f):return
    t=open(f,encoding='utf8').read()
    for m in re.finditer(r'''(?:from\s*|import\s*\(\s*|import\s+|require\(\s*)['"](\.[^'"]+)['"]''',t):
        r=res(f,m.group(1))
        if r:walk(r)
walk(os.path.normpath('src/main.tsx'))
open('scratch/reachable.txt','w').write('\n'.join(sorted(p.replace('\\','/') for p in seen)))
allf=[os.path.join(d,n).replace('\\','/') for d,_,ns in os.walk('src') for n in ns]
rep=open('AUDITORIA_LIMPEZA_CODIGO.md',encoding='utf8').read().split('\n')
iO=next(i for i,l in enumerate(rep) if 'LEGADO / C' in l)
act=set();orf=set()
for i,l in enumerate(rep):
    ms=[os.path.basename(m) for m in re.findall(r'`([^`]+\.(?:tsx?|css))`',l)]
    if i<iO:act.update(ms)
    elif i<121:orf.update(ms)
for f in allf:
    b=os.path.basename(f);r=os.path.normpath(f) in seen
    say='ATIVO' if b in act else 'ORFAO' if b in orf else '(nao citado)'
    if (r and say!='ATIVO') or (not r and say!='ORFAO'):print(f,'|',say,'|','alcancavel' if r else 'inalcancavel')
