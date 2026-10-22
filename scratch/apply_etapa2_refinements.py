import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# 1. Update in manual files
def update_manual(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Echo Beacon
    old_echo = 'PASSIVA: Ao reportar qualquer vulnerabilidade [NOISY], compre 1 carta do Main Deck.'
    new_echo = 'PASSIVA: Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compre 1 carta do Main Deck.'
    if old_echo in content:
        content = content.replace(old_echo, new_echo)
        print(f"[{fpath}] Echo Beacon atualizado!")
    else:
        print(f"[{fpath}] AVISO: old_echo não encontrado!")

    # Honeypot Triggered!
    old_honey = 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão.'
    new_honey = 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão (em partidas de 2 jogadores, descarta apenas 1 carta).'
    if old_honey in content:
        content = content.replace(old_honey, new_honey)
        print(f"[{fpath}] Honeypot Triggered! atualizado!")
    else:
        print(f"[{fpath}] AVISO: old_honey não encontrado!")

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

update_manual('public/pwned-manual-sucesso-v1.html')
update_manual('pwned-manual-sucesso-v1.html')

# 2. Update in full80DeckData.ts
with open('src/data/full80DeckData.ts', 'r', encoding='utf-8') as f:
    ts_code = f.read()

old_echo_ts = "simpleDescription: 'PASSIVA: Ao reportar qualquer vulnerabilidade [NOISY], compre 1 carta do Main Deck.',\n    ptDescription: 'PASSIVA: Ao reportar qualquer vulnerabilidade [NOISY], compra 1 carta do Main Deck.'"
new_echo_ts = "simpleDescription: 'PASSIVA: Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compre 1 carta do Main Deck.',\n    ptDescription: 'PASSIVA: Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compra 1 carta do Main Deck.'"

if old_echo_ts in ts_code:
    ts_code = ts_code.replace(old_echo_ts, new_echo_ts)
    with open('src/data/full80DeckData.ts', 'w', encoding='utf-8') as f:
        f.write(ts_code)
    print("[full80DeckData.ts] Echo Beacon atualizado!")
else:
    print("[full80DeckData.ts] AVISO: old_echo_ts não encontrado!")

# 3. Update in full24EventsData.ts
with open('src/data/full24EventsData.ts', 'r', encoding='utf-8') as f:
    evt_code = f.read()

old_honey_evt = "simpleDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão.',\n    ptDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão.'"
new_honey_evt = "simpleDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão (em partidas de 2 jogadores, descarta apenas 1 carta).',\n    ptDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão (em partidas de 2 jogadores, descarta apenas 1 carta).'"

if old_honey_evt in evt_code:
    evt_code = evt_code.replace(old_honey_evt, new_honey_evt)
    with open('src/data/full24EventsData.ts', 'w', encoding='utf-8') as f:
        f.write(evt_code)
    print("[full24EventsData.ts] Honeypot Triggered! atualizado!")
else:
    print("[full24EventsData.ts] AVISO: old_honey_evt não encontrado!")

# 4. Check cardsData.ts for echo beacon
with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    cdata = f.read()

if 'tool-echo-beacon' in cdata:
    # let's see snippet
    idx = cdata.find('tool-echo-beacon')
    print("[cardsData.ts] tool-echo-beacon encontrado no arquivo")
