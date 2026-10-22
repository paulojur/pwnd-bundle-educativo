import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

prog_blocks = re.findall(r'\{\s*id:\s*[\'"][^\'"]+[\'"].*?name:\s*[\'"]([^\'"]+)[\'"].*?companyType:\s*[\'"]([^\'"]+)[\'"].*?allowedClasses:\s*([^\n,]+|\[[^\]]+\]).*?patchSpeed:\s*[\'"]([^\'"]+)[\'"].*?flatBountyBonus:\s*(\d+).*?\}', text, re.DOTALL)

print(f"Total cópias de programas encontradas: {len(prog_blocks)}")
unique_programs = {}
for name, comp, classes, speed, bonus in prog_blocks:
    if name not in unique_programs:
        unique_programs[name] = (comp, classes.strip(), speed, bonus)

print(f"\nProgramas Únicos ({len(unique_programs)} alvos):")
for name, (comp, classes, speed, bonus) in unique_programs.items():
    print(f"  • {name} ({comp}) | Escopo: {classes} | Patch: {speed} | Bônus: +${bonus}")
