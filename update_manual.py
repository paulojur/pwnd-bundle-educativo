import re

manual_path = r"f:\PWND Bundle Educativo - Copia\public\pwnd-manual.html"

with open(manual_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add to TOC
toc_entry = """                <li><a href="#conduta" class="toc-link"><span class="toc-num">18</span><span
                            class="toc-label">Código de Conduta</span></a></li>
            </ul>"""
content = re.sub(r'</ul>\s*</nav>', toc_entry + '\n          </nav>', content)

# Add section content before </main>
section_content = """
            <!-- ================= 18 CÓDIGO DE CONDUTA ================= -->
            <section id="conduta">
                <h2 class="sec"><span class="num">18</span> CÓDIGO DE CONDUTA — BUG BOUNTY É LEGAL, NÃO É HACKING ILEGAL</h2>
                <div class="desc-box" style="margin-top:1.5rem;">
                    <p>PWND! simula o mundo do bug bounty: programas autorizados onde empresas
                    pagam por vulnerabilidades encontradas dentro de um escopo definido. Tudo
                    no jogo acontece num ambiente fictício e controlado.</p>
                </div>
                
                <h3 class="subsec" style="margin-top:2rem;">Regras de ouro do pesquisador ético:</h3>
                <ol style="margin-bottom:2rem;">
                    <li>Só testas sistemas que te autorizaram explicitamente</li>
                    <li>Reportas a vulnerabilidade antes de a divulgar</li>
                    <li>Dás tempo para a correção (prática comum: 90 dias)</li>
                    <li>Não acedes a dados além do necessário para provar o impacto</li>
                    <li>Não vendes informação de vulnerabilidades a terceiros</li>
                </ol>
                
                <p>No jogo vs. na vida real: cada decisão que tomas na mesa tem um equivalente
                real com consequências legais. PWND! é uma porta de entrada para a conversa
                sobre segurança digital responsável, não um manual de técnicas de ataque.</p>
            </section>
"""

content = re.sub(r'</main>', section_content + '\n        </main>', content)

# Also update Event Cards count in the component section (Section 02)
content = re.sub(r'23\s*Cartas\s*de\s*Evento', '24 Cartas de Evento', content)
content = re.sub(r'23\s*Event\s*Cards', '24 Event Cards', content)
content = re.sub(r'\(23x\)', '(24x)', content)

# Also update the 126=120+N... wait, the prompt says "Não alterar ... contagens 120/126".
# So maybe the 126 remains the same if the new event card doesn't count for the 126 total, or maybe it does. "Nenhum valor... ou regra alterada".
# "Atualizar a contagem de Event Cards de 23 para 24 na Seção 02 (Componentes) e onde mais for referenciado."
content = re.sub(r'23\s*Cartas de Evento', '24 Cartas de Evento', content)

with open(manual_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Manual updated.")
