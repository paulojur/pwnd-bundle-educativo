import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for c in cards:
    if c['id'] == 'inj-14':
        c['description'] = '[NOISY] PROCESSO ZUMBI: Ao reportar com sucesso, compre 1 carta do Main Deck imediatamente.'
        c['ptDescription'] = '[NOISY] PROCESSO ZUMBI: Ao reportar com sucesso, compra 1 carta do Main Deck imediatamente.'
        print('Updated inj-14')
    elif c['id'] == 'xss-11':
        c['description'] = 'PROVA OOB: Esta vulnerabilidade é imune a Event Cards (não pode ser descartada por Eventos enquanto estiver na Zona de Exploits).'
        c['ptDescription'] = 'PROVA OOB: Esta vulnerabilidade é imune a Event Cards (não pode ser descartada por Eventos enquanto estiver na Zona de Exploits).'
        print('Updated xss-11')
    elif c['id'] == 'leg-1':
        c['description'] = '[NOISY] EFEITO DOMINÓ: Ao descer esta vulnerabilidade, você pode baixar imediatamente 1 vulnerabilidade adicional da mão na Zona de Exploits (respeitando escopo e limite de 3 cartas).'
        c['ptDescription'] = '[NOISY] EFEITO DOMINÓ: Ao descer esta vulnerabilidade, podes baixar imediatamente 1 vulnerabilidade adicional da mão na Zona de Exploits (respeitando escopo e limite de 3 cartas).'
        print('Updated leg-1')
    elif c['id'] == 'leg-4':
        c['description'] = '[NOISY] TÍTERE: Ao reportar com sucesso, ative imediatamente o efeito de 1 Tool Card de qualquer oponente na mesa como se fosse sua (o oponente mantém a carta).'
        c['ptDescription'] = '[NOISY] TÍTERE: Ao reportar com sucesso, ativa imediatamente o efeito de 1 Tool Card de qualquer oponente na mesa como se fosse tua (o oponente mantém a carta).'
        print('Updated leg-4')
    elif c['id'] == 'leg-5':
        c['description'] = '[NOISY] MARIONETE: Ao reportar com sucesso, force 1 oponente a descartar 1 Tool ativa à sua escolha. Se ele não tiver Tools ativas, descarte 1 carta aleatória da mão dele.'
        c['ptDescription'] = '[NOISY] MARIONETE: Ao reportar com sucesso, força 1 oponente a descartar 1 Tool ativa à tua escolha. Se ele não tiver Tools ativas, descarta 1 carta aleatória da mão dele.'
        print('Updated leg-5')

with open('vulnerabilidades_pnp_fisico.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print('vulnerabilidades_pnp_fisico.json salvo com sucesso!')
