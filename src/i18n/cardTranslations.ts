import { CardV2 } from '../data/cardsDataV2';
import { Language } from './translations';

export const getLocalizedCardDescription = (card: CardV2, language: Language): string => {
  if (language === 'pt') {
    return card.simpleDescription || card.ptDescription || card.technicalReference;
  }

  // Language is 'en'
  // 1. Tool cards translation (canonical V1.4)
  if (card.type === 'tool') {
    const tId = (card.toolId || card.id || '').toUpperCase();
    if (tId.startsWith('T-01')) return '[PASSIVE] Hand limit +1 card while installed.';
    if (tId.startsWith('T-02')) return '[PASSIVE] +$500 per XSS card in your Report.';
    if (tId.startsWith('T-03')) return '[PASSIVE] Draw 1 Main Deck card when reporting SSRF or [NOISY].';
    if (tId.startsWith('T-04')) return '[PASSIVE] Deploy BAC vulnerabilities ignoring program scope.';
    if (tId.startsWith('T-05')) return '[ACTIVE] Refresh the 3 exposed Market Programs (+$500 if APT/ALL, else draw 1 card).';
    if (tId.startsWith('T-06')) return '[ACTIVE] Look at top 3 Main Deck cards: draw 1 and order the other 2 on top.';
    if (tId.startsWith('T-07')) return '[ACTIVE] Look at top 3 Event Deck cards: discard 1 and order the other 2 on top.';
    if (tId.startsWith('T-08')) return '[PASSIVE] Deploy INJ vulnerabilities ignoring program scope.';
    if (tId.startsWith('T-09')) return '[ACTIVE] Cancel a negative Event Card targeting you (does not block Patch).';
    if (tId.startsWith('T-10')) return '[PASSIVE] Draw 3 cards instead of 2 on Recon action.';
    if (tId.startsWith('T-11')) return '[PASSIVE] On your first Exploit action of the turn, deploy 2 vulnerabilities instead of 1.';
    if (tId.startsWith('T-12')) return '[PASSIVE] +$500 per AUTH card in your Report.';
    return card.simpleDescription || `Tactical Security Tool: equips in tool rack to grant tactical gameplay bonuses.`;
  }

  // 2. Defuse / Safeguard cards translation
  if (card.type === 'defuse') {
    const name = card.name.toLowerCase();
    if (name.includes('bypass')) return 'Cancels 1 Patch Deployed defense roll, keeping exploits on target (+1 Alert).';
    if (name.includes('cve')) return 'CVE Protection: grants permanent slot for public coordinated disclosure.';
    return 'Defensive safeguard: mitigates corporate defense responses.';
  }

  // 3. Exploit / Vulnerability cards translation
  if (card.isNoisy && card.simpleDescription) {
    return card.simpleDescription;
  }

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

