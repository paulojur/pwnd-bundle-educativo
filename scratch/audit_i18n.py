import os
import re

active_files = [
    'src/components/BoardGameMain.tsx',
    'src/components/ActionPointsBar.tsx',
    'src/components/BoardHand.tsx',
    'src/components/BountyLedgerModal.tsx',
    'src/components/CenterMarketMat.tsx',
    'src/components/FullTableView.tsx',
    'src/components/PlayerMat.tsx',
    'src/components/EventCardModal.tsx',
    'src/components/MultiplayerLobbyModal.tsx',
    'src/components/PlayerAidModal.tsx',
    'src/components/ProgramSelectorModal.tsx',
    'src/components/PrintAndPlayModal.tsx',
    'src/components/DiceRoller.tsx',
    'src/components/ObserverMetricsModal.tsx',
    'src/context/BoardGameContext.tsx',
    'src/utils/gameRulesV14.ts',
    'src/i18n/cardTranslations.ts',
    'src/i18n/translations.ts',
]

for f in active_files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    has_use_lang = 'useLanguage' in content
    lines = content.splitlines()
    print(f"=== {f} ({len(lines)} lines) | useLanguage: {has_use_lang} ===")

