# Auditoria do Chip de Classe (80 Vulnerabilities)

## 1. Cobertura e Fallbacks

| ID | Nome | Tech Ref | Classe Detectada | Status (OK/FALLBACK) | Erro/Keyword | Emoji? |
|---|---|---|---|---|---|---|
| inj-1 | Injeção de Boato | SQL Injection (SQLi) | INJ | OK |  | ✅ Não |
| inj-2 | A Injeção da Vovó | SQL Injection (SQLi) | INJ | OK |  | ✅ Não |
| inj-3 | Sopa de Comandos | OS Command Injection | INJ | OK |  | ✅ Não |
| inj-4 | A Entidade Fantasma | XXE Injection | INJ | OK |  | ✅ Não |
| inj-5 | O Molde Quebrado | Server-Side Template Injection | INJ | OK |  | ✅ Não |
| inj-6 | O Cabeçalho Falso | HTTP Header Injection | INJ | OK |  | ✅ Não |
| inj-7 | O Operador Vazado | NoSQL Injection | INJ | OK |  | ✅ Não |
| inj-8 | O Mapa Invertido | ORM Injection | INJ | OK |  | ✅ Não |
| inj-9 | O Atalho Cego | XPath Injection | INJ | OK |  | ✅ Não |
| inj-10 | O Filtro Furado | LDAP Injection | INJ | OK |  | ✅ Não |
| inj-11 | A Bomba-Relógio | Time-Based Blind SQLi | INJ | OK |  | ✅ Não |
| inj-12 | O Veneno Lento | Second-Order SQLi | INJ | OK |  | ✅ Não |
| inj-13 | A Esteira Quebrada | Automated Injection | INJ | OK |  | ✅ Não |
| inj-14 | O Operário Zumbi | Async Worker RCE | INJ | OK |  | ✅ Não |
| inj-15 | O Tubo Estourado | Critical Database Takeover | INJ | OK |  | ✅ Não |
| inj-16 | O Enxerto Tóxico | DLL Search Order Hijacking | INJ | OK |  | ✅ Não |
| bac-1 | Porta Escancarada | Insecure Direct Object Reference (IDOR) | BAC | OK |  | ✅ Não |
| bac-2 | O Plebeu Privilegiado | Privilege Escalation (PrivEsc) | BAC | OK |  | ✅ Não |
| bac-3 | O Corredor Secreto | Directory Traversal | BAC | OK |  | ✅ Não |
| bac-4 | A Fronteira Aberta | Cross-Origin Resource Sharing | BAC | OK |  | ✅ Não |
| bac-5 | A Maçaneta Quebrada | Direct Resource Leak | BAC | OK |  | ✅ Não |
| bac-6 | O Quarto do Vizinho | Broken Object Level Auth (BOLA) | BAC | OK |  | ✅ Não |
| bac-7 | O Elevador de Serviço | Broken Function Level Auth | BAC | OK |  | ✅ Não |
| bac-8 | A Parede de Papel | Multi-Tenant Isolation Bypass | BAC | OK |  | ✅ Não |
| bac-9 | A Passagem Secreta | Unprotected Admin Route | BAC | OK |  | ✅ Não |
| bac-10 | O Degrau Oculto | JWT Role Manipulation | BAC | OK |  | ✅ Não |
| bac-11 | O Molho de Chaves | Mass Assignment / Auto-Binding | BAC | OK |  | ✅ Não |
| bac-12 | O Arquivo Destrancado | Bulk Export IDOR | BAC | OK |  | ✅ Não |
| bac-13 | A Catraca Livre | Global Authorization Bypass | BAC | OK |  | ✅ Não |
| bac-14 | A Sala do Trono | Root Organization Takeover | BAC | OK |  | ✅ Não |
| xss-1 | Espelho Falso | Cross-Site Scripting (Reflected XSS) | XSS | OK |  | ✅ Não |
| xss-2 | O Labirinto de Espelhos | DOM-based XSS | XSS | OK |  | ✅ Não |
| xss-3 | O Eco Mortal | Reflected XSS | XSS | OK |  | ✅ Não |
| xss-4 | A Sombra Enganosa | DOM Manipulation XSS | XSS | OK |  | ✅ Não |
| xss-5 | A Ilusão de Ótica | HTML Injection | XSS | OK |  | ✅ Não |
| xss-6 | O Reflexo Congelado | Stored XSS | XSS | OK |  | ✅ Não |
| xss-7 | O Quadro Amaldiçoado | SVG File Upload XSS | XSS | OK |  | ✅ Não |
| xss-8 | A Máscara Rachada | Attribute Injection XSS | XSS | OK |  | ✅ Não |
| xss-9 | A Tinta Invisível | Markdown Parser XSS | XSS | OK |  | ✅ Não |
| xss-10 | O Espelho Narcisista | Reflected XSS Advanced | XSS | OK |  | ✅ Não |
| xss-11 | O Reflexo Cego | Blind Stored XSS | XSS | OK |  | ✅ Não |
| xss-12 | O Fio Transparente | WebSocket XSS Hijack | XSS | OK |  | ✅ Não |
| auth-1 | Chave Mestra | Authentication Bypass | AUTH | OK |  | ✅ Não |
| auth-2 | Cookie Unsigned | Cookie Tampering | AUTH | OK |  | ✅ Não |
| auth-3 | A Senha do Caderno | Weak Reset Token | AUTH | OK |  | ✅ Não |
| auth-4 | O Porteiro Esquecido | Persistent Session Leak | AUTH | OK |  | ✅ Não |
| auth-5 | O Distintivo Falso | Authentication Bypass (JWT None) | AUTH | OK |  | ✅ Não |
| auth-6 | O Clone de Identidade | Automated Account Takeover | AUTH | OK |  | ✅ Não |
| auth-7 | O Gêmeo Maligno | OAuth CSRF / State Fixation | AUTH | OK |  | ✅ Não |
| auth-8 | O Guarda Distraído | Multi-Factor Auth Bypass | AUTH | OK |  | ✅ Não |
| auth-9 | O Selo Violado | Alg None JWT Attack | AUTH | OK |  | ✅ Não |
| auth-10 | O Sósia do Executivo | SAML Response Tampering | AUTH | OK |  | ✅ Não |
| ssrf-1 | O Espião Interno | Server-Side Request Forgery (SSRF) | SSRF | OK |  | ✅ Não |
| ssrf-2 | A Carta Forjada | Cross-Site Request Forgery | SSRF | OK |  | ✅ Não |
| ssrf-3 | O Radar Subterrâneo | Network Scanning via SSRF | SSRF | OK |  | ✅ Não |
| ssrf-4 | O Fantasma na Máquina | SSRF via Webhook | SSRF | OK |  | ✅ Não |
| ssrf-5 | O Segredo do Servidor | AWS EC2 Metadata SSRF | SSRF | OK |  | ✅ Não |
| ssrf-6 | O Endereço Traiçoeiro | DNS Rebinding Bypass | SSRF | OK |  | ✅ Não |
| ssrf-7 | O Pombo Correio | OOB Interaction SSRF | SSRF | OK |  | ✅ Não |
| ssrf-8 | O Mensageiro Cego | Gopher SSRF to Redis RCE | SSRF | OK |  | ✅ Não |
| bl-1 | O Relógio Quebrado | Business Logic Error | LOGIC | OK |  | ✅ Não |
| bl-2 | O Troco Infinito | Negative Amount Logic Flaw | LOGIC | OK |  | ✅ Não |
| bl-3 | A Pilha de Cupons | Coupon Reuse Logic | LOGIC | OK |  | ✅ Não |
| bl-4 | A Entrega Fantasma | Race Condition | LOGIC | OK |  | ✅ Não |
| bl-5 | O Centavo de Ouro | Floating Point Currency Flaw | LOGIC | OK |  | ✅ Não |
| bl-6 | A Amostra Grátis Eterna | Subscription Logic Bypass | LOGIC | OK |  | ✅ Não |
| bl-7 | O Carrinho Sem Fundo | Integer Overflow in Cart | LOGIC | OK |  | ✅ Não |
| bl-8 | A Nota Duplicada | State Machine Duplication | LOGIC | OK |  | ✅ Não |
| crypto-1 | Cadeado de Papel | Weak Cryptography (MD5 / Single Hash) | CRYPTO | OK |  | ✅ Não |
| crypto-2 | O Cofre de Plástico | Weak Hash / No Salt | CRYPTO | OK |  | ✅ Não |
| crypto-3 | A Chave debaixo do Tapete | Embedded Secret Key | CRYPTO | OK |  | ✅ Não |
| crypto-4 | O Diário Aberto | Insecure Data Transmission | CRYPTO | OK |  | ✅ Não |
| crypto-5 | O Oráculo Fofoqueiro | CBC Padding Oracle | CRYPTO | OK |  | ✅ Não |
| crypto-6 | O Padrão Repetido | AES ECB Pattern Leak | CRYPTO | OK |  | ✅ Não |
| leg-1 | O Efeito Dominó | Multi-Stage Chained Exploit | LEGENDARY | FALLBACK | Sem match | ✅ Não |
| leg-2 | A Tempestade Perfeita | SSRF to Internal Admin Chain | LEGENDARY | FALLBACK | Sem match | ✅ Não |
| leg-3 | O Apocalipse Primaveril | Remote Code Execution (RCE) | LEGENDARY | OK (Real Legendary) |  | ✅ Não |
| leg-4 | O Mestre dos Títeres | Remote Code Execution (RCE) | LEGENDARY | OK (Real Legendary) |  | ✅ Não |
| leg-5 | O Boneco de Marionete | Remote Code Execution (RCE root) | LEGENDARY | OK (Real Legendary) |  | ✅ Não |
| leg-6 | A Caixa de Pandora | Log4Shell / Java Deserialization | LEGENDARY | OK (Real Legendary) |  | ✅ Não |

**Total VULN Cards:** 80
**Fallbacks Críticos Encontrados:** 2

## 2. Consistência de Paleta (Carta vs Manual Seção 12/16)

| Classe | Hex (Código) | RGB Convertido | RGB Esperado (Prompt) | Match? |
|---|---|---|---|---|
| INJ | #f0883e | rgb(240,136,62) | rgb(230,126,34) | ❌ Diferente |
| BAC | #c084fc | rgb(192,132,252) | rgb(75,0,130) | ❌ Diferente |
| XSS | #f472b6 | rgb(244,114,182) | TBD | ❌ Diferente |
| AUTH | #eab308 | rgb(234,179,8) | TBD | ❌ Diferente |
| SSRF | #38bdf8 | rgb(56,189,248) | TBD | ❌ Diferente |
| LOGIC | #2dd4bf | rgb(45,212,191) | TBD | ❌ Diferente |
| CRYPTO | #39d353 | rgb(57,211,83) | TBD | ❌ Diferente |
| LEGENDARY | #a855f7 | rgb(168,85,247) | TBD | ❌ Diferente |

## 3. Zero Emojis

Tem emojis nos labels? **NÃO (OK)**

## 4. Sincronia com o Manual

O manual na Seção 16 documenta molduras e selos, mas NÃO documenta o layout real do cabeçalho da carta com [CHIP DE CLASSE] [CVSS] [EXPLOIT]. É recomendável adicionar uma linha no manual sobre este layout (NÃO ALTERADO NESTA SESSÃO).

