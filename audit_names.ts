import * as fs from 'fs';
import * as path from 'path';

const OLD_NAMES = [
  "Injeção de Boato", "A Injeção da Vovó", "OS Command Input", "XML External Entity", "Template Injection",
  "Header Injection", "NoSQL Operator Leak", "ORM Leakage", "XPath Injection", "LDAP Filter Bypass",
  "Blind SQLi via Time", "Second-Order Injection", "Automated SQLi Pipeline", "Command Injection Worker",
  "Zero-Day SQLi Master", "DLL Injection Pipeline", "Porta Escancarada", "O Plebeu Privilegiado",
  "Path Traversal", "CORS Misconfiguration", "Insecure Direct Pointer", "BOLA no Ângulo",
  "BFLA (Function Level)", "Tenant Data Leak", "Hardcoded Admin Route", "PrivEsc via JWT Claim",
  "Mass Assignment Flaw", "IDOR em Relatórios", "Bypass Completo de ACL", "Master Admin Hijack",
  "Espelho Falso", "O Labirinto de Espelhos", "Reflected XSS em Busca", "DOM XSS via Hash",
  "HTML Payload Injection", "Stored XSS em Comentários", "XSS via Upload SVG", "Attribute Breakout",
  "Markdown Script Exec", "O Espelho Narcisista", "Blind XSS no Admin", "WebSocket Session Hijack",
  "Chave Mestra", "Cookie Unsigned", "Reset Token Previsível", "Remember Me Leak", "A Porta dos Fundos",
  "Credential Stuffing", "OAuth State Poisoning", "MFA Race Condition", "JWT Signature None",
  "SSO Hijacking Master", "O Espião Interno", "CSRF em Ações Críticas", "Internal Port Scanner",
  "Fantasma na Máquina", "Cloud Metadata Leak", "DNS Rebinding Attack", "Out-of-band SSRF",
  "Redis Unauth via Gopher", "O Relógio Quebrado", "Preço Negativo na Carteira", "Coupon Stacking Exploit",
  "Glicor por um Fio", "Rounding Error Overflow", "Infinite Trial Loop", "Cart Quantity Overflow",
  "Unverified Transfer Duplication", "Cadeado de Papel", "Criptografia de Pão Duro", "Hardcoded Private Key",
  "Cleartext Sensitive Data", "Padding Oracle Attack", "ECB Mode Key Leak", "Chain Attack Alpha",
  "Chain Attack Beta", "Spring4Shell RCE", "Controle Remoto Total", "Boneco de Marionete", "Deserialização Macabra"
];

// Read all files in src/data
const dataDir = path.join(process.cwd(), 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

console.log("=== 1. BUSCA POR NOMES ANTIGOS ===");
files.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  OLD_NAMES.forEach(name => {
    // Only flag it if it's actually an old name that was CHANGED.
    // Some names like "Injeção de Boato" were KEPT. So we should only flag ones that were ACTUALLY removed.
    // Wait, the prompt says: "Grep em TODO o src/ pelos nomes antigos que foram renomeados, incluindo: OS Command Input..."
    if (content.includes(`'${name}'`) || content.includes(`"${name}"`)) {
       console.log(`Encontrado: "${name}" em ${file}`);
    }
  });
});
