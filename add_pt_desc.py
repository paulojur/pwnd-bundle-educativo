import re
import os

def replace_ptpt(text):
    if not isinstance(text, str):
        return text
    replacements = {
        r'\bvocê deve\b': 'tu deves',
        r'\bVocê deve\b': 'Tu deves',
        r'\bvocê estiver\b': 'tu estiveres',
        r'\bVocê estiver\b': 'Tu estiveres',
        r'\bvocê recebe\b': 'tu recebes',
        r'\bVocê recebe\b': 'Tu recebes',
        r'\bvocê est[áa]\b': 'tu estás',
        r'\bVocê est[áa]\b': 'Tu estás',
        r'\bvocê apenas usou\b': 'tu apenas usaste',
        r'\bVocê apenas usou\b': 'Tu apenas usaste',
        r'\bvocê assume\b': 'tu assumes',
        r'\bVocê assume\b': 'Tu assumes',
        r'\bvocê clica\b': 'tu clicas',
        r'\bVocê clica\b': 'Tu clicas',
        r'\bvocê cochicha\b': 'tu cochichas',
        r'\bVocê cochicha\b': 'Tu cochichas',
        r'\bvocê coloca\b': 'tu colocas',
        r'\bVocê coloca\b': 'Tu colocas',
        r'\bvocê compra\b': 'tu compras',
        r'\bVocê compra\b': 'Tu compras',
        r'\bvocê convence\b': 'tu convences',
        r'\bVocê convence\b': 'Tu convences',
        r'\bvocê deixar\b': 'tu deixares',
        r'\bVocê deixar\b': 'Tu deixares',
        r'\bvocê desceu\b': 'tu desceste',
        r'\bVocê desceu\b': 'Tu desceste',
        r'\bvocê descobre\b': 'tu descobres',
        r'\bVocê descobre\b': 'Tu descobres',
        r'\bvocê executa\b': 'tu executas',
        r'\bVocê executa\b': 'Tu executas',
        r'\bvocê explora\b': 'tu exploras',
        r'\bVocê explora\b': 'Tu exploras',
        r'\bvocê fica\b': 'tu ficas',
        r'\bVocê fica\b': 'Tu ficas',
        r'\bvocê joga\b': 'tu jogas',
        r'\bVocê joga\b': 'Tu jogas',
        r'\bvocê mantiver\b': 'tu mantiveres',
        r'\bVocê mantiver\b': 'Tu mantiveres',
        r'\bvocê mesmo\b': 'ti mesmo',
        r'\bVocê mesmo\b': 'Ti mesmo',
        r'\bvocê monta\b': 'tu montas',
        r'\bVocê monta\b': 'Tu montas',
        r'\bvocê muda\b': 'tu mudas',
        r'\bVocê muda\b': 'Tu mudas',
        r'\bvocê não tiver\b': 'tu não tiveres',
        r'\bVocê não tiver\b': 'Tu não tiveres',
        r'\bvocê pode\b': 'tu podes',
        r'\bVocê pode\b': 'Tu podes',
        r'\bvocê precisa\b': 'tu precisas',
        r'\bVocê precisa\b': 'Tu precisas',
        r'\bvocê sofre\b': 'tu sofres',
        r'\bVocê sofre\b': 'Tu sofres',
        r'\bvocê tiver\b': 'tu tiveres',
        r'\bVocê tiver\b': 'Tu tiveres',
        r'\bvocê é\b': 'tu és',
        r'\bVocê é\b': 'Tu és',
        r'\bimpede você de realizar\b': 'impede-te de realizar',
        r'\bimpede Você de realizar\b': 'impede-te de realizar',
        
        r'\bvocê\b': 'tu',
        r'\bVocê\b': 'Tu',
        
        r'\bseu\b': 'teu',
        r'\bSeu\b': 'Teu',
        r'\bsua\b': 'tua',
        r'\bSua\b': 'Tua',
        r'\bseus\b': 'teus',
        r'\bSeus\b': 'Teus',
        r'\bsuas\b': 'tuas',
        r'\bSuas\b': 'Tuas',
        
        r'\brodada\b': 'ronda',
        r'\bRodada\b': 'Ronda',
        r'\brodadas\b': 'rondas',
        r'\bRodadas\b': 'Rondas',
        
        r'\bembaralhar\b': 'baralhar',
        r'\bEmbaralhar\b': 'Baralhar',
        r'\bembaralhe\b': 'baralha',
        r'\bEmbaralhe\b': 'Baralha',
        r'\bembaralhadas\b': 'baralhadas',
        r'\bEmbaralhadas\b': 'Baralhadas',
        r'\bembaralhados\b': 'baralhados',
        r'\bEmbaralhados\b': 'Baralhados',
        r'\bembaralhado\b': 'baralhado',
        r'\bEmbaralhado\b': 'Baralhado',
        r'\bembaralha\b': 'baralha',
        r'\bEmbaralha\b': 'Baralha',
        
        r'\bbônus\b': 'bónus',
        r'\bBônus\b': 'Bónus',
        
        r'\bbanco de dados\b': 'base de dados',
        r'\bBanco de dados\b': 'Base de dados',
        r'\bBanco de Dados\b': 'Base de Dados',
        
        r'\bsenhas\b': 'palavras-passe',
        r'\bSenhas\b': 'Palavras-passe',
        r'\bsenha\b': 'palavra-passe',
        r'\bSenha\b': 'Palavra-passe',
        
        r'\barquivo\b': 'ficheiro',
        r'\bArquivo\b': 'Ficheiro',
        r'\barquivos\b': 'ficheiros',
        r'\bArquivos\b': 'Ficheiros',
        
        r'\bcelular\b': 'telemóvel',
        r'\bCelular\b': 'Telemóvel',
    }
    
    for pattern, repl in replacements.items():
        text = re.sub(pattern, repl, text)
    return text

original_events = r"f:\PWND Bundle Educativo\src\data\full23EventsData.ts"
original_cards = r"f:\PWND Bundle Educativo\src\data\cardsData.ts"
new_events = r"f:\PWND Bundle Educativo - Copia\src\data\full24EventsData.ts"
new_cards = r"f:\PWND Bundle Educativo - Copia\src\data\cardsData.ts"

# 1. Read originals
with open(original_events, "r", encoding="utf-8") as f:
    orig_ev_text = f.read()
with open(original_cards, "r", encoding="utf-8") as f:
    orig_ca_text = f.read()

# Build dicts of original descriptions
orig_ev_desc = {}
for match in re.finditer(r"id:\s*'([^']+)'[\s\S]*?simpleDescription:\s*'([^']+)'", orig_ev_text):
    orig_ev_desc[match.group(1)] = match.group(2)

orig_prog_desc = {}
for match in re.finditer(r"id:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'", orig_ca_text):
    orig_prog_desc[match.group(1)] = match.group(2)

orig_arch_title = {}
orig_arch_playstyle = {}
orig_arch_powers = {}
for match in re.finditer(r"id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?playstyle:\s*'([^']+)'[\s\S]*?specialPowers:\s*(\[[^\]]+\])", orig_ca_text):
    orig_arch_title[match.group(1)] = match.group(2)
    orig_arch_playstyle[match.group(1)] = match.group(3)
    orig_arch_powers[match.group(1)] = match.group(4)

# 2. Update new files
with open(new_events, "r", encoding="utf-8") as f:
    new_ev_text = f.read()

# Add ptDescription to interface
if "ptDescription?:" not in new_ev_text:
    new_ev_text = new_ev_text.replace("simpleDescription: string;", "simpleDescription: string;\n  ptDescription?: string;")

def repl_ev(m):
    obj = m.group(0)
    if 'ptDescription:' in obj: return obj
    _id = re.search(r"id:\s*'([^']+)'", obj).group(1)
    
    # We want to replace the simpleDescription in this block
    old_simp_match = re.search(r"simpleDescription:\s*'([^']+)'", obj)
    old_simp = old_simp_match.group(1)
    
    pt_br = orig_ev_desc.get(_id, old_simp) # Fallback to current if evt-24
    
    # But wait! For evt-24, it might already be in PT-PT, we have to manually reverse it to pt-BR if we want.
    # Actually, we can just leave it, and replace_ptpt(pt_br) will be identical for evt-24.
    
    pt_pt = replace_ptpt(pt_br)
    
    new_block = re.sub(
        r"simpleDescription:\s*'([^']+)'",
        f"simpleDescription: '{pt_br}',\n    ptDescription: '{pt_pt}'",
        obj
    )
    return new_block

# We split the array into objects roughly
new_ev_text = re.sub(r"\{\s*id:\s*'[^']+'[\s\S]*?effectType:[^\}]+\}", repl_ev, new_ev_text)

with open(new_events, "w", encoding="utf-8") as f:
    f.write(new_ev_text)

with open(new_cards, "r", encoding="utf-8") as f:
    new_ca_text = f.read()

if "ptDescription?:" not in new_ca_text:
    new_ca_text = new_ca_text.replace("description: string;", "description: string;\n  ptDescription?: string;")
    new_ca_text = new_ca_text.replace("title: string;", "title: string;\n  ptTitle?: string;")
    new_ca_text = new_ca_text.replace("playstyle: string;", "playstyle: string;\n  ptPlaystyle?: string;")
    new_ca_text = new_ca_text.replace("specialPowers: string[];", "specialPowers: string[];\n  ptSpecialPowers?: string[];")

def repl_prog(m):
    obj = m.group(0)
    if 'ptDescription:' in obj: return obj
    _id = re.search(r"id:\s*'([^']+)'", obj).group(1)
    pt_br = orig_prog_desc.get(_id, "")
    pt_pt = replace_ptpt(pt_br)
    
    # For program cards, they end with description
    new_block = re.sub(
        r"description:\s*'([^']+)'",
        f"description: '{pt_br}',\n    ptDescription: '{pt_pt}'",
        obj
    )
    return new_block

# Find all Program cards inside PROGRAM_CARDS
parts = re.split(r'export const ARCHETYPES', new_ca_text)
programs_part = parts[0]
archetypes_part = "export const ARCHETYPES" + parts[1]

# Apply to programs part
# Matches blocks with id: 'prog-...'
programs_part = re.sub(r"\{\s*id:\s*'prog-[^']+[\s\S]*?description:\s*'[^']+'\s*\}", repl_prog, programs_part)

def repl_arch(m):
    obj = m.group(0)
    if 'ptTitle:' in obj: return obj
    _id = re.search(r"id:\s*'([^']+)'", obj).group(1)
    
    title_br = orig_arch_title.get(_id, "")
    play_br = orig_arch_playstyle.get(_id, "")
    pow_br = orig_arch_powers.get(_id, "[]")
    
    title_pt = replace_ptpt(title_br)
    play_pt = replace_ptpt(play_br)
    
    # Array mapping
    elements = re.findall(r"'([^']*)'", pow_br)
    pt_elements = [f"'{replace_ptpt(e)}'" for e in elements]
    pow_pt = f"[{', '.join(pt_elements)}]"
    
    obj = re.sub(r"title:\s*'([^']+)'", f"title: '{title_br}',\n    ptTitle: '{title_pt}'", obj)
    obj = re.sub(r"playstyle:\s*'([^']+)'", f"playstyle: '{play_br}',\n    ptPlaystyle: '{play_pt}'", obj)
    obj = re.sub(r"specialPowers:\s*(\[[^\]]+\])", f"specialPowers: {pow_br},\n    ptSpecialPowers: {pow_pt}", obj)
    
    return obj

archetypes_part = re.sub(r"\{\s*id:\s*'arch-[^']+[\s\S]*?avatarIcon:\s*'[^']+'\s*\}", repl_arch, archetypes_part)

new_ca_text = programs_part + archetypes_part

with open(new_cards, "w", encoding="utf-8") as f:
    f.write(new_ca_text)

print("Injections successful!")
