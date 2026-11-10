import re,json,csv,sys,io
sys.stdout.reconfigure(encoding='utf8')
src=open('src/data/canonicalV14Data.ts',encoding='utf8').read()
def arr(name):
    m=re.search(r'export const '+name+r'[^=]*= \[',src);i=m.end()-1
    j=src.index('\n];',i)+2
    return json.loads(src[i:j])
def tsv(n):
    return list(csv.DictReader(open('Screentop/TSV/'+n,encoding='utf8',newline=''),delimiter='\t',quoting=csv.QUOTE_NONE))
def N(x):
    if x is None:return ''
    x=str(x).replace('\u201c','"').replace('\u201d','"').replace('\u2019',"'").replace('\u2018',"'").replace('\r','').replace('\\n',' ')
    return re.sub(r'\s+',' ',x).strip().lower()
def money(s):
    s=N(s).replace('$','').replace(' ','')
    if not s:return None
    k='k' in s;s=s.replace('k','')
    s=s.replace('.','') if (not k and re.fullmatch(r'\d{1,3}(\.\d{3})+',s)) else s
    try:return float(s.replace(',','.'))*(1000 if k else 1)
    except:return s
out=[]
def d(i,f,t,c):
    if N(t)!=N(c):out.append((i,f,str(t)[:70],str(c)[:70]))
def multiset(name,T,C,idt,idc,maps):
    ct={};cc={}
    for r in T:ct[r[idt]]=ct.get(r[idt],0)+1
    for r in C:cc[r[idc]]=cc.get(r[idc],0)+1
    print(name,'TSV rows',len(T),'code',len(C),'ids',len(ct),len(cc))
    for k in set(ct)|set(cc):
        if ct.get(k,0)!=cc.get(k,0):out.append((k,'copias',ct.get(k,0),cc.get(k,0)))
    # pair by id + occurrence order
    from collections import defaultdict
    cd=defaultdict(list)
    for r in C:cd[r[idc]].append(r)
    seen=defaultdict(int)
    for r in T:
        k=r[idt];n=seen[k];seen[k]+=1
        if n>=len(cd[k]):continue
        c=cd[k][n]
        for tf,cf,fn in maps:
            tv=r.get(tf);cv=c.get(cf)
            if fn=='money':
                if money(tv)!=money(cv):out.append((k,cf,tv,cv))
            elif fn=='noise':
                d(k,cf,'noisy' if N(tv) in('noisy',) else 'stealth', 'noisy' if cv else 'stealth')
            elif fn=='list':
                if sorted(x.strip().lower() for x in tv.split(','))!=sorted(x.lower() for x in cv):out.append((k,cf,tv,cv))
            elif fn=='thr':
                m=re.search(r'\((\d+)',tv);
                if not m or int(m.group(1))!=cv:out.append((k,cf,tv,cv))
            elif fn=='cvss':
                d(k,cf,tv.replace('CVSS','').strip(),cv.replace('CVSS','').strip())
            else:d(k,cf,tv,cv)
V=arr('V14_VULNERABILITIES')
multiset('VULN',tsv('vulnerabilidades_80.tsv'),V,'Id','id',[('Title','name',0),('Subtitle','technicalReference',0),('Class','vulnClass',0),('Bounty','bounty','money'),('CVSS','cvss','cvss'),('Noise','isNoisy','noise'),('Body','description',0),('ShortDesc','shortDesc',0)])
for r in tsv('vulnerabilidades_80.tsv'):
    pass
# rarity: TSV 'COMMON • $1.5k'
rt={r['Id']:r['Rarity'].split('•')[0].strip() for r in tsv('vulnerabilidades_80.tsv')}
for c in V:
    if rt.get(c['id']) and N(rt[c['id']])!=N(c['rarity']):out.append((c['id'],'rarity',rt[c['id']],c['rarity']))
multiset('TOOL',tsv('ferramentas_48.tsv'),arr('V14_TOOLS'),'Id','id',[('Title','name',0),('Subtitle','technicalReference',0),('Type','toolType',0),('Moment','moment',0),('Body','description',0),('ShortDesc','shortDesc',0)])
multiset('PROG',tsv('programas_36.tsv'),arr('V14_PROGRAMS'),'Id','id',[('Title','name',0),('Subtitle','companyType',0),('Class','allowedClasses','list'),('VelocidadePatch','patchSpeedRaw',0),('VelocidadePatch','patchThreshold','thr'),('Bounty','bonusBounty','money'),('Body','description',0)])
multiset('EVT',tsv('eventos_24.tsv'),arr('V14_EVENTS'),'Id','id',[('Title','title',0),('Subtitle','subtitle',0),('Moment','moment',0),('Type','type',0),('Body','description',0)])
multiset('SAFE',tsv('safeguards_10.tsv'),arr('V14_SAFEGUARDS'),'Id','id',[('Title','name',0),('Subtitle','technicalReference',0),('Rarity','safeguardType',0),('Body','description',0)])
A=tsv('arquetipos_6.tsv');AC=arr('V14_ARCHETYPES')
print('ARCH',len(A),len(AC))
for t in A:
    c=[x for x in AC if N(x['name'])==N(t['Title'])]
    if not c:out.append((t['Title'],'ausente no codigo','',''));continue
    c=c[0];d(c['id'],'abilityName',t['Id'].lstrip('# '),c['abilityName']);d(c['id'],'title',t['Subtitle'],c['title']);d(c['id'],'description',t['Body'],c['description'])
print('main deck/safeguards ids:',[s['id'] for s in arr('V14_SAFEGUARDS')])
print('DIFFS',len(out))
for o in out[:80]:print(' | '.join(map(str,o)))
