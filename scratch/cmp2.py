import re,csv,sys
sys.stdout.reconfigure(encoding='utf8')
def ids(f,pat):return re.findall(pat,open(f,encoding='utf8').read())
e=ids('src/data/full24EventsData.ts',r"id: '(evt-\d+)'")
et=[r['Id'] for r in csv.DictReader(open('Screentop/TSV/eventos_24.tsv',encoding='utf8'),delimiter='\t')]
print('events ids code',len(e),'tsv',len(et),'common',len(set(e)&set(et)))
t=open('src/data/full24EventsData.ts',encoding='utf8').read()
tt={r['Id']:r for r in csv.DictReader(open('Screentop/TSV/eventos_24.tsv',encoding='utf8'),delimiter='\t')}
N=lambda x:re.sub(r'\s+',' ',x).strip().lower()
bad=0
for m in re.finditer(r"id: '(evt-\d+)'.*?name: '([^']*)'.*?simpleDescription: '((?:[^'\\]|\\.)*)'",t,re.S):
    i,n,dsc=m.groups()
    if i in tt and (N(tt[i]['Title'])!=N(n) or N(tt[i]['Body'])!=N(dsc.replace("\\'","'"))):bad+=1
print('events with name/body mismatch',bad)
v=ids('src/data/full80DeckData.ts',r"\n    id: '([^']+)'")
vt=[r['Id'] for r in csv.DictReader(open('Screentop/TSV/vulnerabilidades_80.tsv',encoding='utf8'),delimiter='\t')]
print('full80 ids',len(v),'ids em comum com TSV vuln',len(set(v)&set(vt)))
