import re
import json

with open('src/data/cardsData.ts', encoding='utf-8') as f:
    text = f.read()

events = re.findall(r'id:\s*[\'"]event-(\d+)[\'"].*?name:\s*[\'"]([^\'"]+)[\'"].*?description:\s*[\'"]([^\'"]+)[\'"]', text, re.DOTALL)
for eid, ename, edesc in events:
    if eid in ['1', '10', '21']:
        print(f'TS Event {eid} ({ename}): {edesc}')
