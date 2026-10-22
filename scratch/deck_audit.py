import json
import re

def audit():
    with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
        vulns = json.load(f)

    print(f"=== AUDITORIA GERAL DE VULNERABILIDADES (TOTAL: {len(vulns)}) ===")
    
    # 1. Checar NOISY vs Rarity e Payout
    noisy_list = [v for v in vulns if v.get('mode') == 'NOISY']
    print(f"\n1. Cartas NOISY ({len(noisy_list)} de {len(vulns)}):")
    for v in noisy_list:
        ab = v.get('habilidade_especial') or 'SEM HABILIDADE'
        print(f"  [{v['id']}] {v['name']} | {v['rarity']} | Payout: {v['bounty']} | Habilidade: {ab}")

    # 2. Checar Cartas com Habilidade Especial (Quais são as 20?)
    with_ab = [v for v in vulns if v.get('habilidade_especial')]
    print(f"\n2. Cartas com Habilidade Especial ({len(with_ab)} cartas):")
    for v in with_ab:
        print(f"  [{v['id']}] {v['name']} ({v['type']}, {v['rarity']}) -> {v['habilidade_especial']}")

    # 3. Textos longos que podem estourar na carta física (63x88mm)
    print("\n3. Cartas com textos mais longos (Risco de quebra/fonte minúscula na impressão):")
    sorted_by_len = sorted(vulns, key=lambda x: len(x.get('description', '') or '') + len(x.get('habilidade_especial', '') or ''), reverse=True)
    for v in sorted_by_len[:10]:
        d_len = len(v.get('description', '') or '')
        h_len = len(v.get('habilidade_especial', '') or '')
        print(f"  [{v['id']}] {v['name']}: Desc={d_len} chars, Hab={h_len} chars (Total={d_len+h_len})")

    # 4. Checar consistência dos Payouts por Raridade
    payout_rarity = {}
    for v in vulns:
        r = v.get('rarity')
        b = v.get('bounty')
        payout_rarity.setdefault(r, set()).add(b)
    print("\n4. Payouts por Raridade:")
    for r, bounties in payout_rarity.items():
        print(f"  {r}: {bounties}")

if __name__ == '__main__':
    audit()
