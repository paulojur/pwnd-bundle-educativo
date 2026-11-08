import { CardV2 } from '../data/cardsDataV2';
import { Language } from './translations';

export const getLocalizedCardDescription = (card: CardV2, language: Language): string => {
  if (language === 'pt') {
    return card.ptDescription || card.simpleDescription || card.technicalReference;
  }

  // Language is 'en'
  // 1. Tool cards translation
  if (card.type === 'tool') {
    const tRef = (card.technicalReference || card.name).toLowerCase();
    if (tRef.includes('burp')) return 'Interception proxy: inspect and manipulate HTTP traffic in real time.';
    if (tRef.includes('nmap')) return 'Network scanner: discover open ports, active services, and OS footprints.';
    if (tRef.includes('sqlmap')) return 'Automated SQL injection detection and database exploitation tool.';
    if (tRef.includes('wireshark')) return 'Packet analyzer: capture and inspect raw network packets in depth.';
    if (tRef.includes('metasploit')) return 'Penetration testing framework with modular exploit execution payloads.';
    if (tRef.includes('gobuster') || tRef.includes('ffuf') || tRef.includes('dirb')) return 'High-speed directory and file brute-forcing utility.';
    if (tRef.includes('hashcat') || tRef.includes('john')) return 'Advanced password cracker using rule-based dictionary attacks.';
    if (tRef.includes('hydra')) return 'Fast network login cracker supporting numerous authentication protocols.';
    if (tRef.includes('nuclei')) return 'Fast and customizable vulnerability scanner based on simple YAML templates.';
    if (tRef.includes('nikto')) return 'Web server scanner for dangerous files, outdated versions, and CGIs.';
    if (tRef.includes('postman')) return 'API platform for building, testing, and debugging REST/GraphQL requests.';
    if (tRef.includes('amass')) return 'In-depth attack surface mapping and external asset discovery tool.';
    return `Tactical Security Tool: equips in tool rack to grant tactical gameplay bonuses.`;
  }

  // 2. Defuse / Safeguard cards translation
  if (card.type === 'defuse') {
    const name = card.name.toLowerCase();
    if (name.includes('bypass')) return 'Cancels 1 Patch Deployed defense roll, keeping exploits on target (+1 Alert).';
    if (name.includes('cve')) return 'CVE Protection: grants permanent slot for public coordinated disclosure.';
    return 'Defensive safeguard: mitigates corporate defense responses.';
  }

  // 3. Exploit / Vulnerability cards translation
  const vClass = (card.vulnClass || '').toUpperCase();
  const tech = card.technicalReference || card.name;

  // Class-based educational English descriptions
  if (vClass === 'INJ') {
    return `${tech}: Untrusted data sent to an interpreter executes unintended commands or queries.`;
  }
  if (vClass === 'BAC') {
    return `${tech}: Flawed access restrictions allow unauthorized viewing, modification, or escalation.`;
  }
  if (vClass === 'XSS') {
    return `${tech}: Injects malicious client-side scripts into web pages viewed by other users.`;
  }
  if (vClass === 'AUTH') {
    return `${tech}: Weak authentication or session management allows credential theft or spoofing.`;
  }
  if (vClass === 'SSRF') {
    return `${tech}: Induces the vulnerable server to make crafted requests to internal/external resources.`;
  }
  if (vClass === 'LOGIC') {
    return `${tech}: Flaw in business logic workflows allows state bypass, duplicate benefits, or fraud.`;
  }
  if (vClass === 'CRYPTO') {
    return `${tech}: Weak cryptography, insecure cipher modes, or sensitive data exposure in transit.`;
  }

  return `${tech}: Security flaw reported for responsible bug bounty disclosure.`;
};

export const getLocalizedScopeBadge = (scopeLabel: string, inScope: boolean, language: Language): string => {
  if (language === 'pt') return scopeLabel;
  if (inScope) return '✓ IN SCOPE';
  if (scopeLabel.includes('ARQUÉTIPO') || scopeLabel.includes('ARCHETYPE')) return '⛔ OUT OF SCOPE (ARCHETYPE)';
  if (scopeLabel.includes('PROGRAMA') || scopeLabel.includes('PROGRAM')) return '⛔ OUT OF SCOPE (PROGRAM)';
  return '⛔ OUT OF SCOPE';
};

