# 🎴 GUIA DEFINITIVO: Automação de Cartas no Photoshop via Variáveis

Este manual ensina como diagramar **1 único template no Photoshop** e gerar **todas as cartas automaticamente em segundos** usando o recurso nativo **Image > Variables (Variáveis de Imagem)**.

---

## 📐 1. Configuração do Canvas no Photoshop (Padrão Gráfico Internacional)

Ao criar o seu arquivo base (`.PSD`):

* **Largura:** `69 mm` *(ou 815 pixels)*
* **Altura:** `94 mm` *(ou 1110 pixels)*
* **Resolução:** `300 Pixels/Polegada`
* **Modo de Cores:** `Cores CMYK` (8 bits)
* **Conteúdo do Plano de Fundo:** Branco ou Transparente

### Criando as Linhas Guia (Rulers):
Vá em **View > New Guide (Visualizar > Nova Guia)** e crie:
1. **Linha de Corte da Guilhotina (63 × 88 mm):**
   * Guias a **3 mm** de cada borda (Superior: 3mm, Inferior: 91mm, Esquerda: 3mm, Direita: 66mm).
2. **Zona Segura de Texto / Safe Area (56 × 81 mm):**
   * Guias a **6,5 mm** de cada borda (Superior: 6,5mm, Inferior: 87,5mm, Esquerda: 6,5mm, Direita: 62,5mm).
   * *Regra de ouro:* Nenhum texto, número ou ícone deve ultrapassar essa margem de segurança interna!

---

## 📂 2. Arquivos de Dados Prontos em `/photoshop_data`

Você tem os arquivos gerados em dois formatos:
* `.csv` (separado por vírgulas)
* `.txt` (separado por tabulação / Tab-delimited — **RECOMENDADO para o Photoshop**, pois evita conflitos com vírgulas de texto!).

| Arquivo | Quantidade | Descrição |
| :--- | :---: | :--- |
| `01_vulnerabilidades_80.txt` | 80 cartas | Main Deck completo (INJ, BAC, XSS, AUTH, SSRF, LOGIC, CRYPTO, LEG) |
| `02_ferramentas_48.txt` | 48 cartas | Tool Deck (12 tipos de ferramentas × 4 cópias) |
| `03_programas_36.txt` | 36 cartas | Program Market (18 alvos corporativos × 2 cópias) |
| `04_eventos_24.txt` | 24 cartas | Event Deck de Caos (24 eventos únicos) |
| `05_safeguards_10.txt` | 10 cartas | 8 cartas Bypass + 2 cartas CVE Assignment Protection |
| `06_player_aids_6.txt` | 6 cartas | Cartas de Ajuda Rápida (Frente e Verso) |
| `07_arquetipos_6.txt` | 6 cartas | Fichas de Arquétipos dos Jogadores |

---

## 🛠️ 3. Diagramando o Template no Photoshop

No seu arquivo `.PSD` de template (ex: `template_vulnerabilidade.psd`):

1. **Desenhe o seu fundo e moldura** (camadas normais de imagem/vetor).
2. **Crie as Camadas de Texto:**
   * Dê nomes claros para as camadas de texto na paleta de Camadas (Layers):
     * `CAMADA_ID` (ex: `#INJ-14`)
     * `CAMADA_NOME` (ex: `O Operário Zumbi`)
     * `CAMADA_SUBTITULO` (ex: `Async Worker RCE`)
     * `CAMADA_CLASSE` (ex: `INJ`)
     * `CAMADA_CVSS` (ex: `CVSS 8.3`)
     * `CAMADA_BOUNTY` (ex: `+$5.0k`)
     * `CAMADA_MODO` (ex: `[NOISY]`)
     * `CAMADA_REGRA` (o texto da habilidade)
3. **DICA CRÍTICA PARA TEXTOS LONGOS (Caixa de Texto):**
   * Para a camada `CAMADA_REGRA`, **NÃO dê apenas um clique com a ferramenta de texto**.
   * **Clique e arraste** para criar uma **Caixa de Texto Retangular delimitada (Paragraph Text)** dentro da Zona Segura.
   * Assim, textos mais longos farão a quebra de linha automática sem estourar para fora da carta!

---

## ⚡ 4. Vinculando o Template aos Dados (O Pulo do Gato)

Com o seu template PSD aberto:

### Passo A: Definir as Variáveis
1. Vá no menu: **Image > Variables > Define (Imagem > Variáveis > Definir)**.
2. No menu suspenso **Layer (Camada)**, selecione a camada que deseja automatizar (ex: `CAMADA_NOME`).
3. Marque a caixinha **Text Replacement (Substituição de Texto)**.
4. No campo **Name (Nome)**, digite o nome **exato** da coluna da planilha (ex: `Nome`).
5. Repita o processo para as outras camadas:
   * Camada `CAMADA_ID` -> Variável `ID`
   * Camada `CAMADA_SUBTITULO` -> Variável `Subtitulo`
   * Camada `CAMADA_CLASSE` -> Variável `ClasseSigla`
   * Camada `CAMADA_CVSS` -> Variável `CVSS`
   * Camada `CAMADA_BOUNTY` -> Variável `Bounty`
   * Camada `CAMADA_MODO` -> Variável `Modo`
   * Camada `CAMADA_REGRA` -> Variável `TextoRegra`
6. Clique em **OK** (ou clique na seta "Next" para ir para Data Sets).

### Passo B: Importar o Arquivo de Dados
1. Vá em **Image > Variables > Data Sets (Imagem > Variáveis > Conjuntos de Dados)**.
2. Clique no botão **Import (Importar...)** no lado direito.
3. Clique em **Select File (Selecionar Arquivo...)** e escolha o arquivo `01_vulnerabilidades_80.txt` (ou o `.csv`).
4. **Opções de Importação:**
   * **Encoding:** `Unicode (UTF-8)`.
   * Marque a caixinha: **Use First Column For Data Set Names**.
5. Clique em **OK**.
6. Pronto! Agora você pode navegar pelas setinhas `<` e `>` do menu Data Sets e ver o Photoshop **trocando todos os textos da carta ao vivo na tela**!

---

## 🚀 5. Exportando Todas as 80 Cartas Prontas com 1 Clique

1. Vá em **File > Export > Data Sets as Files (Arquivo > Exportar > Conjuntos de Dados como Arquivos)**.
2. Escolha uma pasta de destino no seu computador (ex: `cartas_finalizadas_vulnerabilidades/`).
3. Em **File Naming (Nome do Arquivo)**, configure como deseja o nome (ex: `PWND_Vuln_Data_Set_Name.psd` ou `.tif`).
4. Clique em **OK**!
5. O Photoshop vai rodar sozinho e salvar cada uma das 80 cartas perfeitamente diagramadas, com os textos, atributos e resoluções impecáveis.

---

## 💡 6. Dicas de Ouro de Quem Já Fez Centenas de Cartas

1. **Fontes & Tamanhos:**
   * Escolha uma fonte para o texto de regra que tenha boa legibilidade em corpo 7.5pt a 8.5pt (ex: *Inter*, *Roboto*, *DIN*, *Share Tech Mono*).
   * Deixe o entrelinhamento (*leading*) em automático ou ~1.2x o tamanho do corpo (ex: fonte 8pt com entrelinha 10pt).
2. **Substituição de Imagens/Ícones (Opcional):**
   * O recurso de Variáveis também aceita substituir imagens automaticamente se você marcar **Pixel Replacement** e colocar o caminho relativo de um arquivo PNG na planilha. Mas para começar, você pode manter ícones vetoriais fixos no template.
3. **Versos das Cartas:**
   * Os 5 versos oficiais já estão salvos em `public/cards-back/` prontos na proporção de corte. Basta enviá-los junto com os lotes de frentes gerados!
