import sys

sys.stdout.reconfigure(encoding='utf-8')

new_programs_ts = """
  // --- 13. BioGen Genomics (2 cópias) ---
  {
    id: 'biogen-1',
    name: 'BioGen Genomics',
    companyType: 'Biotecnologia & Pesquisa Clínica',
    allowedClasses: ['Cryptographic Failures', 'Broken Access Control', 'SSRF'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bônus Fixos',
    flatBountyBonus: 2500,
    description: 'Pesquisa genômica confidencial. Foco em servidores internos de sequenciamento e controle de prontuários.',
    ptDescription: 'Investigação genómica confidencial. Foco em servidores internos e controlo de acesso.'
  },
  {
    id: 'biogen-2',
    name: 'BioGen Genomics',
    companyType: 'Biotecnologia & Pesquisa Clínica',
    allowedClasses: ['Cryptographic Failures', 'Broken Access Control', 'SSRF'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bônus Fixos',
    flatBountyBonus: 2500,
    description: 'Pesquisa genômica confidencial. Foco em servidores internos de sequenciamento e controle de prontuários.',
    ptDescription: 'Investigação genómica confidencial. Foco em servidores internos e controlo de acesso.'
  },

  // --- 14. Veloce AutoTech (2 cópias) ---
  {
    id: 'veloce-1',
    name: 'Veloce AutoTech',
    companyType: 'Firmware Automotivo & IoT',
    allowedClasses: ['Injection', 'Business Logic', 'Authentication'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de elite.',
    ptDescription: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de topo.'
  },
  {
    id: 'veloce-2',
    name: 'Veloce AutoTech',
    companyType: 'Firmware Automotivo & IoT',
    allowedClasses: ['Injection', 'Business Logic', 'Authentication'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de elite.',
    ptDescription: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de topo.'
  },

  // --- 15. Voltz PowerGrid (2 cópias) ---
  {
    id: 'voltz-1',
    name: 'Voltz PowerGrid',
    companyType: 'Infraestrutura Crítica & SCADA',
    allowedClasses: ['Injection', 'Broken Access Control'],
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bônus Fixos',
    flatBountyBonus: 0,
    description: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.',
    ptDescription: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.'
  },
  {
    id: 'voltz-2',
    name: 'Voltz PowerGrid',
    companyType: 'Infraestrutura Crítica & SCADA',
    allowedClasses: ['Injection', 'Broken Access Control'],
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bônus Fixos',
    flatBountyBonus: 0,
    description: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.',
    ptDescription: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.'
  },

  // --- 16. PulseStream Media (2 cópias) ---
  {
    id: 'pulsestream-1',
    name: 'PulseStream Media',
    companyType: 'Mídia Digital & Distribuição DRM',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Cryptographic Failures'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de assinaturas.',
    ptDescription: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de subscrições.'
  },
  {
    id: 'pulsestream-2',
    name: 'PulseStream Media',
    companyType: 'Mídia Digital & Distribuição DRM',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Cryptographic Failures'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de assinaturas.',
    ptDescription: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de subscrições.'
  },

  // --- 17. AeroOrbit Avionics (2 cópias) ---
  {
    id: 'aeroorbit-1',
    name: 'AeroOrbit Avionics',
    companyType: 'Tecnologia Aeroespacial & Satélites',
    allowedClasses: ['SSRF', 'Authentication', 'Cryptographic Failures'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.',
    ptDescription: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.'
  },
  {
    id: 'aeroorbit-2',
    name: 'AeroOrbit Avionics',
    companyType: 'Tecnologia Aeroespacial & Satélites',
    allowedClasses: ['SSRF', 'Authentication', 'Cryptographic Failures'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.',
    ptDescription: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.'
  },

  // --- 18. FazendaGov Digital (2 cópias) ---
  {
    id: 'fazendagov-1',
    name: 'FazendaGov Digital',
    companyType: 'Administração Tributária Pública',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'Authentication'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Sistema fiscal e emissão de notas eletrônicas. Auditoria em regras de cálculo e autorizações.',
    ptDescription: 'Sistema fiscal e emissão de faturas eletrónicas. Auditoria em regras de cálculo e autorizações.'
  },
  {
    id: 'fazendagov-2',
    name: 'FazendaGov Digital',
    companyType: 'Administração Tributária Pública',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'Authentication'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Sistema fiscal e emissão de notas eletrônicas. Auditoria em regras de cálculo e autorizações.',
    ptDescription: 'Sistema fiscal e emissão de faturas eletrónicas. Auditoria em regras de cálculo e autorizações.'
  }
"""

with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = "    ptDescription: 'Frequentes vulnerabilidades de lógica em promoções e requisições forjadas de rastreamento.'\n  }\n];"
replacement = "    ptDescription: 'Frequentes vulnerabilidades de lógica em promoções e requisições forjadas de rastreamento.'\n  }," + new_programs_ts + "\n];"

if target in content:
    content = content.replace(target, replacement, 1)
    with open('src/data/cardsData.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("PROGRAM_CARDS em cardsData.ts atualizado com os 6 novos programas!")
else:
    print("ERRO: target não encontrado em cardsData.ts")
