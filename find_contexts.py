import re
import os

files_to_check = [
    r"f:\PWND Bundle Educativo - Copia\src\data\full80DeckData.ts",
    r"f:\PWND Bundle Educativo - Copia\src\data\cardsData.ts",
    r"f:\PWND Bundle Educativo - Copia\src\data\full23EventsData.ts",
    r"f:\PWND Bundle Educativo - Copia\public\pwnd-manual.html",
    r"f:\PWND Bundle Educativo - Copia\index.html"
]

voces = set()
seus = set()

for file_path in files_to_check:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            # find "você" and next 2 words
            matches = re.findall(r'(?i)(você\s+\w+\s*\w*)', content)
            for m in matches:
                voces.add(m.lower())
            
            # find "seu/sua" and next word
            matches_seu = re.findall(r'(?i)(\b(?:seu|sua|seus|suas)\b\s+\w+)', content)
            for m in matches_seu:
                seus.add(m.lower())

print("VOCÊ CONTEXTS:")
for v in sorted(voces):
    print(v)

print("\nSEU/SUA CONTEXTS:")
for s in sorted(seus):
    print(s)
