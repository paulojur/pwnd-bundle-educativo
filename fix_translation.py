import re
import os

files_to_check = [
    r"f:\PWND Bundle Educativo - Copia\src\data\full80DeckData.ts",
    r"f:\PWND Bundle Educativo - Copia\src\data\cardsData.ts",
    r"f:\PWND Bundle Educativo - Copia\src\data\full24EventsData.ts",
    r"f:\PWND Bundle Educativo - Copia\public\pwnd-manual.html",
    r"f:\PWND Bundle Educativo - Copia\index.html"
]

def replace_ptpt(text):
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

for file_path in files_to_check:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "full80DeckData.ts" in file_path:
            # We already have ptDescription, but it's identical to pt-BR because the regex failed.
            # We must translate the content inside ptDescription.
            def pt_desc_replacer(match):
                prefix = match.group(1) # "ptDescription: '"
                text = match.group(2)
                translated = replace_ptpt(text)
                return prefix + translated + "'"
                
            content = re.sub(r"(ptDescription:\s*')([^']+)'", pt_desc_replacer, content)
            
            # Also translate flavorText
            def flavor_replacer(match):
                prefix = match.group(1)
                text = match.group(2)
                return prefix + replace_ptpt(text) + "'"
            content = re.sub(r"(flavorText:\s*')([^']+)'", flavor_replacer, content)
            
        else:
            content = replace_ptpt(content)
            
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
            
print("Fix applied successfully!")
