const fs = require('fs');
const path = require('path');

const files = [
    "f:/PWND Bundle Educativo - Copia/src/data/full80DeckData.ts",
    "f:/PWND Bundle Educativo - Copia/src/data/cardsData.ts",
    "f:/PWND Bundle Educativo - Copia/src/data/full23EventsData.ts",
    "f:/PWND Bundle Educativo - Copia/public/pwnd-manual.html",
    "f:/PWND Bundle Educativo - Copia/index.html"
];

function replacePtPt(text) {
    const replacements = [
        [/\\bvocê deve\\b/g, 'tu deves'],
        [/\\bVocê deve\\b/g, 'Tu deves'],
        [/\\bvocê estiver\\b/g, 'tu estiveres'],
        [/\\bVocê estiver\\b/g, 'Tu estiveres'],
        [/\\bvocê recebe\\b/g, 'tu recebes'],
        [/\\bVocê recebe\\b/g, 'Tu recebes'],
        [/\\bvocê está\\b/g, 'tu estás'],
        [/\\bVocê está\\b/g, 'Tu estás'],
        [/\\bvocê apenas usou\\b/g, 'tu apenas usaste'],
        [/\\bVocê apenas usou\\b/g, 'Tu apenas usaste'],
        [/\\bvocê assume\\b/g, 'tu assumes'],
        [/\\bVocê assume\\b/g, 'Tu assumes'],
        [/\\bvocê clica\\b/g, 'tu clicas'],
        [/\\bVocê clica\\b/g, 'Tu clicas'],
        [/\\bvocê cochicha\\b/g, 'tu cochichas'],
        [/\\bVocê cochicha\\b/g, 'Tu cochichas'],
        [/\\bvocê coloca\\b/g, 'tu colocas'],
        [/\\bVocê coloca\\b/g, 'Tu colocas'],
        [/\\bvocê compra\\b/g, 'tu compras'],
        [/\\bVocê compra\\b/g, 'Tu compras'],
        [/\\bvocê convence\\b/g, 'tu convences'],
        [/\\bVocê convence\\b/g, 'Tu convences'],
        [/\\bvocê deixar\\b/g, 'tu deixares'],
        [/\\bVocê deixar\\b/g, 'Tu deixares'],
        [/\\bvocê desceu\\b/g, 'tu desceste'],
        [/\\bVocê desceu\\b/g, 'Tu desceste'],
        [/\\bvocê descobre\\b/g, 'tu descobres'],
        [/\\bVocê descobre\\b/g, 'Tu descobres'],
        [/\\bvocê executa\\b/g, 'tu executas'],
        [/\\bVocê executa\\b/g, 'Tu executas'],
        [/\\bvocê explora\\b/g, 'tu exploras'],
        [/\\bVocê explora\\b/g, 'Tu exploras'],
        [/\\bvocê fica\\b/g, 'tu ficas'],
        [/\\bVocê fica\\b/g, 'Tu ficas'],
        [/\\bvocê joga\\b/g, 'tu jogas'],
        [/\\bVocê joga\\b/g, 'Tu jogas'],
        [/\\bvocê mantiver\\b/g, 'tu mantiveres'],
        [/\\bVocê mantiver\\b/g, 'Tu mantiveres'],
        [/\\bvocê mesmo\\b/g, 'ti mesmo'],
        [/\\bVocê mesmo\\b/g, 'Ti mesmo'],
        [/\\bvocê monta\\b/g, 'tu montas'],
        [/\\bVocê monta\\b/g, 'Tu montas'],
        [/\\bvocê muda\\b/g, 'tu mudas'],
        [/\\bVocê muda\\b/g, 'Tu mudas'],
        [/\\bvocê não tiver\\b/g, 'tu não tiveres'],
        [/\\bVocê não tiver\\b/g, 'Tu não tiveres'],
        [/\\bvocê pode\\b/g, 'tu podes'],
        [/\\bVocê pode\\b/g, 'Tu podes'],
        [/\\bvocê precisa\\b/g, 'tu precisas'],
        [/\\bVocê precisa\\b/g, 'Tu precisas'],
        [/\\bvocê sofre\\b/g, 'tu sofres'],
        [/\\bVocê sofre\\b/g, 'Tu sofres'],
        [/\\bvocê tiver\\b/g, 'tu tiveres'],
        [/\\bVocê tiver\\b/g, 'Tu tiveres'],
        [/\\bvocê é\\b/g, 'tu és'],
        [/\\bVocê é\\b/g, 'Tu és'],
        [/\\bimpede você de realizar\\b/g, 'impede-te de realizar'],
        [/\\bimpede Você de realizar\\b/g, 'impede-te de realizar'],
        
        [/\\bvocê\\b/g, 'tu'],
        [/\\bVocê\\b/g, 'Tu'],
        
        [/\\bseu\\b/g, 'teu'],
        [/\\bSeu\\b/g, 'Teu'],
        [/\\bsua\\b/g, 'tua'],
        [/\\bSua\\b/g, 'Tua'],
        [/\\bseus\\b/g, 'teus'],
        [/\\bSeus\\b/g, 'Teus'],
        [/\\bsuas\\b/g, 'tuas'],
        [/\\bSuas\\b/g, 'Tuas'],
        
        [/\\brodada\\b/g, 'ronda'],
        [/\\bRodada\\b/g, 'Ronda'],
        [/\\brodadas\\b/g, 'rondas'],
        [/\\bRodadas\\b/g, 'Rondas'],
        
        [/\\bembaralhar\\b/g, 'baralhar'],
        [/\\bembaralhe\\b/g, 'baralha'],
        [/\\bEmbaralhe\\b/g, 'Baralha'],
        [/\\bEmbaralhar\\b/g, 'Baralhar'],
        
        [/\\bbônus\\b/g, 'bónus'],
        [/\\bBônus\\b/g, 'Bónus'],
        
        [/\\bbanco de dados\\b/g, 'base de dados'],
        [/\\bBanco de dados\\b/g, 'Base de dados'],
        [/\\bBanco de Dados\\b/g, 'Base de Dados'],
        
        [/\\bsenhas\\b/g, 'palavras-passe'],
        [/\\bSenhas\\b/g, 'Palavras-passe'],
        [/\\bsenha\\b/g, 'palavra-passe'],
        [/\\bSenha\\b/g, 'Palavra-passe'],
        
        [/\\barquivo\\b/g, 'ficheiro'],
        [/\\bArquivo\\b/g, 'Ficheiro'],
        [/\\barquivos\\b/g, 'ficheiros'],
        [/\\bArquivos\\b/g, 'Ficheiros'],
        
        [/\\bcelular\\b/g, 'telemóvel'],
        [/\\bCelular\\b/g, 'Telemóvel'],
    ];

    let result = text;
    for (const [pattern, repl] of replacements) {
        result = result.replace(pattern, repl);
    }
    return result;
}

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        
        if (file.includes('full80DeckData.ts')) {
            // For simpleDescription, copy it to ptDescription
            content = content.replace(/simpleDescription:\\s*'([^']*)'/g, (match, p1) => {
                const ptDesc = replacePtPt(p1);
                return `simpleDescription: '${p1}',\\n    ptDescription: '${ptDesc}'`;
            });
            // Also replace flavorTexts if they exist
            content = content.replace(/flavorText:\\s*'([^']*)'/g, (match, p1) => {
                return `flavorText: '${replacePtPt(p1)}'`;
            });
        } else if (file.includes('full23EventsData.ts')) {
            // Update FULL_23_EVENTS to FULL_24_EVENTS
            content = content.replace(/FULL_23_EVENTS/g, 'FULL_24_EVENTS');
            content = replacePtPt(content);
        } else {
            content = replacePtPt(content);
        }
        
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`Processed ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
}
