import { CardV2 } from '../data/cardsDataV2';
import { ProgramCard, Archetype } from '../data/cardsData';
import { BountyMilestone } from '../utils/gameRulesV14';
import { Language } from './translations';

const VULN_EN_DESCRIPTIONS: Record<string, string> = {
  // Power & Noisy Vulnerabilities (23 cards)
  'APT-1': 'When deployed, you may immediately deploy 1 additional vulnerability from your hand into the Exploits Zone (respecting scope and the 3-card limit).',
  'APT-3': 'On a successful Report, BEFORE replacing your active program, discard up to 3 market programs and reveal the same number of new ones.',
  'APT-4': 'On a successful Report, steal 1 installed Tool Card from 1 opponent of your choice and install it on your mat (if no free slot, discard it).',
  'APT-5': 'On a successful Report, force 1 opponent to discard 1 active Tool of their choice. If they have no active Tools, discard 1 random card from their hand.',
  'APT-6': 'On a successful Report, ignore the Cost of Success: do not draw any Event Card.',
  'AUTH-9': 'This vulnerability is immune to Event Cards (cannot be discarded by Events while in the Exploits Zone).',
  'AUTH-10': 'On a successful Report and BEFORE payout, transfer $1,000 from the player with the highest balance to your Bounty Track.',
  'BAC-11': 'This vulnerability counts as in-scope for your active program, even if it does not allow its class.',
  'BAC-13': 'When deployed onto the table, discard 1 market program and reveal 1 new one.',
  'BAC-14': 'On a successful Report, look at the top 3 cards of the Event Deck, discard up to 1, and arrange the rest on top in any order.',
  'BL-6': 'On a successful Report, rescue 1 Tool Card from the discard pile directly into your hand.',
  'BL-8': 'On a successful Report, receive an additional $1,000 in this Report\'s payout.',
  'CRYPTO-6': 'When deployed onto the table, discard 1 market program and reveal 1 new one.',
  'INJ-2': 'On a successful Report, draw 2 cards from the Main Deck.',
  'INJ-12': 'This vulnerability counts as in-scope for your active program, even if it does not allow its class.',
  'INJ-13': 'On a successful Report, receive an additional $1,000 in this Report\'s payout.',
  'INJ-14': 'On a successful Report, draw 2 cards from the Main Deck.',
  'INJ-15': 'On a successful Report, draw 1 card from the Main Deck and choose 1 opponent to discard 1 card from their hand.',
  'SSRF-7': 'This vulnerability is immune to Event Cards (cannot be discarded by Events while in the Exploits Zone).',
  'SSRF-8': 'On a successful Report, rescue 1 Tool Card from the discard pile directly into your hand.',
  'XSS-10': 'While this vulnerability is in your Exploits Zone and you have Browser DevTools installed, your Recon action draws 1 additional card.',
  'XSS-11': 'This vulnerability is immune to Event Cards (cannot be discarded by Events while in the Exploits Zone).',
  'XSS-12': 'Transfer 1 of your Alert Tokens to the player on your right (if you have none, they receive 1).',

  // Standard Stealth Vulnerabilities (57 cards)
  'AUTH-1': 'You discover a gap in the turnstile and walk right in without typing a password or showing ID.',
  'AUTH-2': 'Modifies admin=false to admin=true in the unsigned browser cookie.',
  'AUTH-3': 'The password reset token uses the exact timestamp in seconds and is easily guessed.',
  'AUTH-4': 'The "Remember Me" token never expires, allowing infinite session reuse.',
  'AUTH-5': 'Changes the JWT header algorithm to "none" and logs in without a password.',
  'AUTH-6': 'Tests leaked password lists in bulk against the login screen.',
  'AUTH-7': 'Omits the state parameter in social OAuth login to forcibly link the victim\'s account.',
  'AUTH-8': 'Bypasses 2-factor SMS code verification by sending parallel requests.',
  'BAC-1': 'You change the number at the end of the URL (from /user/10 to /user/1) and access the director\'s account.',
  'BAC-2': 'Intern alters a profile parameter in the request and becomes system administrator.',
  'BAC-3': 'Uses ../../../etc/passwd in the image parameter to download local server files.',
  'BAC-4': 'Access-Control-Allow-Origin: * misconfiguration leaking private user data.',
  'BAC-5': 'PDF invoice download URLs publicly exposed without authorization checks.',
  'BAC-6': 'Swaps the object ID in the mobile REST API call to query third-party records.',
  'BAC-7': 'Accesses the /admin/delete_all_users endpoint that forgot to verify the session token.',
  'BAC-8': 'Bypasses cloud tenant isolation to access data from neighboring organizations.',
  'BAC-9': 'Hidden /management/dashboard route accessible without login requirements.',
  'BAC-10': 'Changes "role": "user" to "role": "superadmin" inside a weakly signed token.',
  'BAC-12': 'Downloads the complete bulk export list of financial reports across all companies.',
  'BL-1': 'Clicking the confirm button at the exact turn of the minute skips payment processing.',
  'BL-2': 'Adds a quantity of -5 items to the shopping cart, making the store pay you.',
  'BL-3': 'Applies a 10% discount coupon 10 times in a row until the item is completely free.',
  'BL-4': 'Clicks the withdrawal button 50 times in the same second before the bank updates the balance.',
  'BL-5': 'Accumulates rounded fractional cents across thousands of banking transactions.',
  'BL-7': 'Overflows the integer item count in the shopping cart, turning the total balance negative.',
  'CRYPTO-1': 'The company locked its secrets with a trivial "123456" key cracked in 2 seconds.',
  'CRYPTO-2': 'Unsalted MD5 password hashes instantly reversed via online rainbow tables.',
  'CRYPTO-3': 'The production private key was hardcoded inside the frontend JavaScript bundle.',
  'CRYPTO-4': 'Credit card data transmitted over plain HTTP without TLS encryption.',
  'CRYPTO-5': 'Decodes encrypted messages by analyzing server padding error responses.',
  'INJ-1': 'Whispers a crafted string into the text field and tricks the database into dumping passwords.',
  'INJ-3': 'Injects operating system commands into unsanitized form fields.',
  'INJ-4': 'The XML parser reads local server files when processing digital invoices.',
  'INJ-5': 'Executes arbitrary commands through variables in the email template engine.',
  'INJ-6': 'Manipulates HTTP headers to inject forged responses into the user\'s browser.',
  'INJ-7': 'Injects $gt and $ne operators into the NoSQL database, bypassing user authentication.',
  'INJ-8': 'Exploits ORM query abstraction flaws to leak private database columns.',
  'INJ-9': 'Traverses the banking XML data tree by manipulating search parameters.',
  'INJ-10': 'Bypasses corporate directory authentication via wildcard LDAP filters.',
  'INJ-11': 'Forces the database to pause for 10 seconds to extract password hash characters.',
  'INJ-16': 'Loads malicious DLL libraries into the legacy software execution path.',
  'SSRF-1': 'Convinces the front-desk server to take a stroll into the secret basement and photograph internal files.',
  'SSRF-2': 'Forges a URL with two hosts: the filter reads the external site, while the server fetches the internal address.',
  'SSRF-3': 'Uses the avatar upload field to scan open ports across the internal corporate network.',
  'SSRF-4': 'The notification webhook sent the internal API key right back to you.',
  'SSRF-5': 'Accesses http://169.254.169.254 and retrieves temporary credentials from CloudNine metadata.',
  'SSRF-6': 'Swaps the DNS server response IP to bypass the local IP blacklist.',
  'XSS-1': 'Places a mirror on the user\'s screen: when they click, they send their session straight to you.',
  'XSS-2': 'Chained DOM-based XSS across dynamic Single Page Application routes.',
  'XSS-3': 'Injects a malicious script into the search bar that reflects unsanitized on the page.',
  'XSS-4': 'Manipulates window.location.hash to execute JavaScript when the element is read.',
  'XSS-5': 'Injects fake <h1> and <iframe> tags into the login screen of unsuspecting users.',
  'XSS-6': 'Saves a script in the support forum that infects anyone who reads the post.',
  'XSS-7': 'Uploads a profile picture in SVG format containing embedded JavaScript code.',
  'XSS-8': 'Escapes the input attribute quote with " onfocus="alert(1) and triggers the payload.',
  'XSS-9': 'Exploits the Markdown parser inside the support ticket text editor.',
  'APT-2': 'Chains a local SSRF to reach the internal container management console.'
};

const VULN_EN_TECH_REFS: Record<string, string> = {
  'INJ-7': 'NoSQLi with $gt and $ne Operators',
  'INJ-10': 'Wildcard Corporate Directory LDAP Injection'
};

export const getLocalizedTechnicalReference = (card: CardV2, language: Language): string => {
  if (language === 'pt') return card.technicalReference;
  const baseId = (card.canonicalId || card.id || '').toUpperCase().replace(/-COPY-\d+$/, '');
  return VULN_EN_TECH_REFS[baseId] || card.technicalReference;
};

export const getLocalizedCardDescription = (card: CardV2, language: Language): string => {
  if (language === 'pt') {
    return card.simpleDescription || card.ptDescription || card.technicalReference;
  }

  // Language is 'en'
  // 1. Tool cards translation (canonical V1.4)
  if (card.type === 'tool') {
    const tId = (card.toolId || card.canonicalId || card.id || '').toUpperCase();
    if (tId.startsWith('T-01')) return 'Your hand size limit increases by +1 card while this Tool is installed.';
    if (tId.startsWith('T-02')) return '+$500 per XSS class card in your Report.';
    if (tId.startsWith('T-03')) return 'When reporting any SSRF vulnerability or [NOISY] tag, draw 1 card from the Main Deck.';
    if (tId.startsWith('T-04')) return 'Deploy 1 BAC class vulnerability even if your active program does not allow that class.';
    if (tId.startsWith('T-05')) return 'Refresh the 3 exposed Market Programs. If any accepts APT or ALL scope, gain +$500; otherwise, draw 1 card from the Main Deck.';
    if (tId.startsWith('T-06')) return 'Look at the top 3 cards of the Main Deck: draw 1 into your hand and order the other 2 on top as you wish.';
    if (tId.startsWith('T-07')) return 'Look at the top 3 cards of the Event Deck, discard 1 of them, and return the rest in any order.';
    if (tId.startsWith('T-08')) return 'Deploy 1 INJ class vulnerability even if your active program does not allow that class.';
    if (tId.startsWith('T-09')) return 'When targeted by a negative Event Card, cancel the Event\'s effect against you (does not protect against PATCH DEPLOYED!).';
    if (tId.startsWith('T-10')) return 'When performing the Recon action, draw 3 cards from the Main Deck instead of 2.';
    if (tId.startsWith('T-11')) return 'On your first Exploit action of the turn, deploy 2 vulnerabilities instead of 1.';
    if (tId.startsWith('T-12')) return '+$500 per AUTH class card in your Report.';
    return card.simpleDescription || 'Tactical Security Tool: equip in your Tools Rack to grant tactical bonuses.';
  }

  // 2. Defuse / Safeguard cards translation
  if (card.type === 'defuse') {
    const name = card.name.toLowerCase();
    if (name.includes('bypass')) {
      return 'Cancels PATCH DEPLOYED! On Report: guarantees Payout without receiving a Tool. In Stealth: preserves your exploits. You gain 1 Alert Token and discard this card. Does not draw Event/Tool. Single use.';
    }
    if (name.includes('cve')) {
      return 'Cancels Duplicate Report!, Out of Scope!, and DNS Hijack! Event Cards targeting you. Single use.';
    }
    return 'Defensive safeguard: mitigates corporate defense responses.';
  }

  // 3. Exploit / Vulnerability cards translation
  const rawId = (card.canonicalId || card.id || '').toUpperCase().replace(/-COPY-\d+$/, '');
  if (VULN_EN_DESCRIPTIONS[rawId]) {
    return VULN_EN_DESCRIPTIONS[rawId];
  }

  // Fallback by card name if canonicalId was not set
  const nameLower = (card.name || '').toLowerCase();
  if (nameLower.includes('spring doom')) return VULN_EN_DESCRIPTIONS['APT-3'];
  if (nameLower.includes('vip double')) return VULN_EN_DESCRIPTIONS['AUTH-10'];
  if (nameLower.includes('free gate')) return VULN_EN_DESCRIPTIONS['BAC-13'];
  if (nameLower.includes('double bill')) return VULN_EN_DESCRIPTIONS['BL-8'];
  if (nameLower.includes('echo pattern')) return VULN_EN_DESCRIPTIONS['CRYPTO-6'];
  if (nameLower.includes('broken belt')) return VULN_EN_DESCRIPTIONS['INJ-13'];
  if (nameLower.includes('zombie worker')) return VULN_EN_DESCRIPTIONS['INJ-14'];
  if (nameLower.includes('blind envoy')) return VULN_EN_DESCRIPTIONS['SSRF-8'];
  if (nameLower.includes('clear wire')) return VULN_EN_DESCRIPTIONS['XSS-12'];
  if (nameLower.includes('puppet master')) return VULN_EN_DESCRIPTIONS['APT-4'];
  if (nameLower.includes('marionette')) return VULN_EN_DESCRIPTIONS['APT-5'];
  if (nameLower.includes('pandora box')) return VULN_EN_DESCRIPTIONS['APT-6'];
  if (nameLower.includes('throne room')) return VULN_EN_DESCRIPTIONS['BAC-14'];
  if (nameLower.includes('burst pipe')) return VULN_EN_DESCRIPTIONS['INJ-15'];
  if (nameLower.includes('broken seal')) return VULN_EN_DESCRIPTIONS['AUTH-9'];
  if (nameLower.includes('keychain')) return VULN_EN_DESCRIPTIONS['BAC-11'];
  if (nameLower.includes('endless trial')) return VULN_EN_DESCRIPTIONS['BL-6'];
  if (nameLower.includes('slow poison')) return VULN_EN_DESCRIPTIONS['INJ-12'];
  if (nameLower.includes('granny inject')) return VULN_EN_DESCRIPTIONS['INJ-2'];
  if (nameLower.includes('pigeon post')) return VULN_EN_DESCRIPTIONS['SSRF-7'];
  if (nameLower.includes('vain mirror')) return VULN_EN_DESCRIPTIONS['XSS-10'];
  if (nameLower.includes('blind mirror')) return VULN_EN_DESCRIPTIONS['XSS-11'];
  if (nameLower.includes('domino effect')) return VULN_EN_DESCRIPTIONS['APT-1'];

  const vClass = (card.vulnClass || '').toUpperCase();
  const tech = getLocalizedTechnicalReference(card, 'en') || card.name;

  if (vClass === 'INJ') return `${tech}: Untrusted data sent to an interpreter executes unintended commands or queries.`;
  if (vClass === 'BAC') return `${tech}: Flawed access restrictions allow unauthorized viewing, modification, or escalation.`;
  if (vClass === 'XSS') return `${tech}: Injects malicious client-side scripts into web pages viewed by other users.`;
  if (vClass === 'AUTH') return `${tech}: Weak authentication or session management allows credential theft or spoofing.`;
  if (vClass === 'SSRF') return `${tech}: Induces the vulnerable server to make crafted requests to internal/external resources.`;
  if (vClass === 'LOGIC') return `${tech}: Flaw in business logic workflows allows state bypass, duplicate benefits, or fraud.`;
  if (vClass === 'CRYPTO') return `${tech}: Weak cryptography, insecure cipher modes, or sensitive data exposure in transit.`;

  return `${tech}: Security flaw reported for responsible bug bounty disclosure.`;
};

export const getLocalizedScopeBadge = (scopeLabel: string, inScope: boolean, language: Language): string => {
  if (language === 'pt') return scopeLabel;

  const bracketMatch = scopeLabel.match(/\[([^\]]+)\]/);
  const bracketTag = bracketMatch ? `[${bracketMatch[1].replace('LIBERADO', 'UNLOCKED').replace('BLOQUEADO', 'BLOCKED').replace('OUTRA', 'OTHER')}]` : '';

  if (scopeLabel.includes('TOOL')) {
    if (scopeLabel.includes('PASSIVA')) return '🧰 TOOL (PASSIVE)';
    if (scopeLabel.includes('ATIVA')) return '🧰 TOOL (ACTIVE)';
    return '🧰 TOOL (TACTICAL)';
  }
  if (scopeLabel.includes('SAFEGUARD')) return '🛡️ SAFEGUARD';
  if (scopeLabel.includes('SEM PROGRAMA')) return '⚠️ NO PROGRAM';
  if (scopeLabel.includes('OUT OF SCOPE!')) return '⛔ OUT OF SCOPE! (EVENT)';
  if (scopeLabel.includes('WAF DEPLOYED')) return `🛡️ WAF DEPLOYED! ${bracketTag || '[INJ BLOCKED]'}`;
  if (scopeLabel.includes('2FA ENFORCED')) return `🔐 2FA ENFORCED! ${bracketTag || '[AUTH BLOCKED]'}`;
  if (scopeLabel.includes('BUG HUNTER')) return '⛔ BUG HUNTER (COMMON/UNCOMMON ONLY)';
  if (scopeLabel.includes('CORINGA DE ESCOPO')) return `🃏 SCOPE WILDCARD ${bracketTag}`;
  if (scopeLabel.includes('ENDPOINT LAB')) return `🚀 ENDPOINT LAB ${bracketTag || '[BAC UNLOCKED]'}`;
  if (scopeLabel.includes('INJECTION LAB')) return `🛢️ INJECTION LAB ${bracketTag || '[INJ UNLOCKED]'}`;
  if (scopeLabel.includes('SCOPE EXPANSION')) return `🌐 SCOPE EXPANSION ${bracketTag}`;
  if (scopeLabel.includes('RED TEAM')) return `🎯 RED TEAM ${bracketTag}`;

  if (inScope) {
    return `🎯 IN SCOPE ${bracketTag}`.trim();
  }
  return `❌ OUT OF SCOPE ${bracketTag}`.trim();
};

export const getLocalizedScopeRejection = (reason: string | undefined, language: Language): string | undefined => {
  if (!reason || language === 'pt') return reason;
  if (reason.includes('Nenhum Programa Corporativo')) return 'No active Corporate Program selected!';
  if (reason.includes('Out of Scope!')) return 'Out of Scope! Event active: you cannot perform the Exploit action this turn.';
  if (reason.includes('WAF Deployed!')) return 'WAF Deployed! Event active this round: INJ class vulnerabilities cannot be deployed!';
  if (reason.includes('2FA Enforced!')) return '2FA Enforced! Event active this round: AUTH class vulnerabilities cannot be deployed!';
  if (reason.includes('Bug Hunter')) return 'Bug Hunter (Volume Attack) is only allowed to deploy Common and Uncommon vulnerabilities!';
  return reason
    .replace('A vulnerabilidade', 'Vulnerability')
    .replace('não é aceita por', 'is not accepted by')
    .replace('Escopo aceito:', 'Accepted scope:')
    .replace('OUTRA', 'OTHER');
};

export const getLocalizedPatchSpeed = (speed: string | undefined, language: Language): string => {
  if (!speed) return language === 'en' ? 'Moderate' : 'Moderada';
  if (language === 'pt') return speed;
  if (speed.includes('Muito Lenta')) return 'Very Slow';
  if (speed.includes('Lenta')) return 'Slow';
  if (speed.includes('Moderada')) return 'Moderate';
  if (speed.includes('Rápida')) return 'Fast';
  if (speed.includes('Extrema')) return 'Extreme';
  return speed;
};

const ARCHETYPE_EN: Record<string, { title: string; power: string; presentation: string; playstyle: string }> = {
  'noob': {
    title: 'Green Hat Hacker',
    power: 'Tool Prospector',
    presentation: 'I can look at the top 3 cards of the Tool Deck after each successful Report, choose 1, and return the rest in any order.',
    playstyle: 'Tool Prospector: after each successful Report, look at the top 3 Tool Deck cards and pick 1.'
  },
  'n00b': {
    title: 'Green Hat Hacker',
    power: 'Tool Prospector',
    presentation: 'I can look at the top 3 cards of the Tool Deck after each successful Report, choose 1, and return the rest in any order.',
    playstyle: 'Tool Prospector: after each successful Report, look at the top 3 Tool Deck cards and pick 1.'
  },
  'the-old-guard': {
    title: 'Seasoned Veteran',
    power: 'Senior Specialist',
    presentation: 'I gain +$500 for each Epic or Legendary card included in a successful Report. Plus, my hand limit increases to 8 cards.',
    playstyle: 'Senior Specialist: +$500 per Epic or Legendary card in a successful Report. Hand limit increased to 8.'
  },
  'old-guard': {
    title: 'Seasoned Veteran',
    power: 'Senior Specialist',
    presentation: 'I gain +$500 for each Epic or Legendary card included in a successful Report. Plus, my hand limit increases to 8 cards.',
    playstyle: 'Senior Specialist: +$500 per Epic or Legendary card in a successful Report. Hand limit increased to 8.'
  },
  'bug-hunter': {
    title: 'Bounty Chaser',
    power: 'Volume Attack',
    presentation: 'I gain +$500 for each card beyond the 1st on a successful Report. Restricted to Common/Uncommon classes. A successful Report with 3 vulnerabilities grants 1 Reputation Token.',
    playstyle: 'Volume Attack: +$500 per card beyond the 1st in a Report. Restricted to Common/Uncommon. Reporting 3 vulnerabilities grants +1 Reputation Token (🐝).'
  },
  'social-engineer': {
    title: 'Master Manipulator',
    power: 'Redirected Chaos',
    presentation: 'When targeted by a negative Event, I can redirect it to another player (1x/round). I can also pull 1 random card from an opponent\'s hand and give 1 card from my hand back (1x/turn).',
    playstyle: 'Redirected Chaos (1x/round): redirect an individual negative Event to another player. Phishing (1x/turn, 1 AP): pull 1 random card from an opponent and give 1 card back.'
  },
  'red-teamer': {
    title: 'Offensive Breaker',
    power: 'No Limits',
    presentation: 'I ignore program scope restrictions and can deploy any vulnerability on any target, but I subtract $1,000 from the total payout of each Report.',
    playstyle: 'No Limits: ignore program scope restrictions on any target, subtracting $1,000 operational cost from each Report payout.'
  },
  'the-pentester': {
    title: 'Methodical Auditor',
    power: 'Methodical Auditor',
    presentation: 'I am immune to Duplicate Report! and Triage Delay!, and gain +$500 for each distinct vulnerability class in my Report beyond the first (max +$1,000).',
    playstyle: 'Methodical Auditor: immune to Duplicate Report! and Triage Delay!. Gain +$500 per distinct vulnerability class beyond the first (max +$1,000).'
  },
  'pentester': {
    title: 'Methodical Auditor',
    power: 'Methodical Auditor',
    presentation: 'I am immune to Duplicate Report! and Triage Delay!, and gain +$500 for each distinct vulnerability class in my Report beyond the first (max +$1,000).',
    playstyle: 'Methodical Auditor: immune to Duplicate Report! and Triage Delay!. Gain +$500 per distinct vulnerability class beyond the first (max +$1,000).'
  }
};

export const getLocalizedArchetype = (archetype: Archetype, language: Language) => {
  if (language === 'pt') {
    return {
      name: archetype.name,
      title: archetype.title,
      power: archetype.specialPowers?.[0] || '',
      presentation: archetype.presentation || archetype.playstyle,
      playstyle: archetype.playstyle
    };
  }
  const key = (archetype.id || '').toLowerCase();
  const en = ARCHETYPE_EN[key];
  if (en) {
    return {
      name: archetype.name,
      title: en.title,
      power: en.power,
      presentation: en.presentation,
      playstyle: en.playstyle
    };
  }
  return {
    name: archetype.name,
    title: archetype.title,
    power: archetype.specialPowers?.[0] || '',
    presentation: archetype.presentation || archetype.playstyle,
    playstyle: archetype.playstyle
  };
};

const PROGRAM_EN: Record<string, { companyType: string; description: string }> = {
  'pending': {
    companyType: 'Select on the Central Board',
    description: 'Click directly on one of the 3 exposed Program Market cards on the Central Board to assign it to your mat!'
  },
  'cloudnine': {
    companyType: 'Cloud Infrastructure Provider',
    description: 'Massive rewards for RCE, SSRF, and cloud infrastructure flaws. High Patch risk!'
  },
  'cryptox': {
    companyType: 'Cryptocurrency Exchange',
    description: 'Digital asset exchange under constant threat of authentication and wallet attacks.'
  },
  'aicore': {
    companyType: 'Generative AI Infrastructure',
    description: 'LLM training clusters vulnerable to Prompt Injection, SSRF, and RCE.'
  },
  'veloce': {
    companyType: 'Automotive Firmware & IoT',
    description: 'Vehicle telemetry and digital keys. High operational risk with elite payouts.'
  },
  'aeroorbit': {
    companyType: 'Aerospace & Satellite Tech',
    description: 'Satellite uplink and ground telemetry. Mission-critical security with maximum bounties.'
  },
  'govportal': {
    companyType: 'Legacy Government System',
    description: 'Legacy access control (BAC) specialist. Slow patch cycle and +$1,000 Report bonus!'
  },
  'educonnect': {
    companyType: 'Educational Platform',
    description: 'Safe learning environment for beginners. Minimal risk of immediate Patch.'
  },
  'voltz': {
    companyType: 'Critical Infrastructure & SCADA',
    description: 'Legacy industrial power grid. Ultra-slow patch cycle, ideal for chaining long combos.'
  },
  'shopall': {
    companyType: 'Multinational E-Commerce',
    description: 'Wide scope. Accepts all vulnerability classes with standard corporate triage.'
  },
  'socialbee': {
    companyType: 'Global Social Network',
    description: 'Focused on privacy flaws, XSS, and social engagement business logic.'
  },
  'gameverse': {
    companyType: 'Massive Multiplayer Gaming Platform',
    description: 'Item injection, virtual currency manipulation, and WebSocket exploits.'
  },
  'deliverydash': {
    companyType: 'Logistics & Delivery App',
    description: 'Urban delivery app susceptible to coupon logic flaws, IDOR, and webhook SSRF.'
  },
  'pulsestream': {
    companyType: 'Digital Media & DRM Streaming',
    description: 'Streaming distribution focused on DRM flaws, web portals, and subscription validation.'
  },
  'taxcore': {
    companyType: 'Public Tax Administration',
    description: 'Electronic invoicing and tax calculation system. Audits in business rules and authorization.'
  },
  'banksafe': {
    companyType: 'Digital Financial Institution',
    description: 'Restricted scope focused on APIs, Authentication, and Cryptography. High payouts!'
  },
  'healthlock': {
    companyType: 'Digital Medical Records (EHR)',
    description: 'Focused on sensitive patient data privacy and hospital record encryption.'
  },
  'paygateway': {
    companyType: 'Payment Processor Gateway',
    description: 'Global financial gateway connecting credit cards and instant payments.'
  },
  'biogen': {
    companyType: 'Biotech & Clinical Research',
    description: 'Confidential genomic research. Focus on internal sequencing servers and access control.'
  }
};

export const getLocalizedProgram = (program: ProgramCard | null | undefined, language: Language) => {
  if (!program) {
    return {
      name: language === 'en' ? 'None' : 'Nenhum',
      companyType: '',
      description: '',
      patchSpeed: language === 'en' ? 'Moderate' : 'Moderada',
      bountyRange: '+$0'
    };
  }
  const cleanBounty = (program.bountyRange || '+$0')
    .replace(/B[óô]nus Fixos/gi, language === 'en' ? 'Flat Bonus' : 'Bônus Fixo');

  if (language === 'pt') {
    return {
      name: program.name,
      companyType: program.companyType,
      description: program.description,
      patchSpeed: program.patchSpeed,
      bountyRange: cleanBounty
    };
  }

  const prefix = (program.id || '').split('-')[0].toLowerCase();
  const en = PROGRAM_EN[prefix];
  return {
    name: program.id === 'pending' ? '[ PENDING: SELECT IN PROGRAM MARKET! ]' : program.name,
    companyType: en?.companyType || program.companyType,
    description: en?.description || program.description,
    patchSpeed: getLocalizedPatchSpeed(program.patchSpeed, 'en'),
    bountyRange: cleanBounty
  };
};

const EVENT_EN: Record<string, { name?: string; targetText: string; description: string }> = {
  'evt-01': {
    targetText: 'All Players',
    description: 'All players discard their highest-CVSS vulnerability deployed on the table (players with an empty table suffer no effect).'
  },
  'evt-02': {
    targetText: 'Choose 1 Opponent',
    description: 'Choose 1 opponent: they discard their highest-CVSS vulnerability on the table (if they have none on the table, they suffer no effect).'
  },
  'evt-03': {
    targetText: 'Report Author',
    description: 'You are blocked from performing the Exploit action (deploying vulnerabilities) on your next turn.'
  },
  'evt-04': {
    targetText: 'Choose 1 Opponent',
    description: 'Choose 1 opponent: they must pay $1.5k from their Bounty Track or are blocked from performing the Report action on their next turn.'
  },
  'evt-05': {
    targetText: 'Report Author',
    description: 'You are blocked from installing or activating Tools on your next turn.'
  },
  'evt-06': {
    targetText: 'All Players',
    description: 'Global mediation settlement! All players immediately receive +$1,500 on the Bounty Track.'
  },
  'evt-07': {
    targetText: 'Player in Last Place',
    description: 'The player with the lowest balance on the Bounty Track rescues 1 Tool Card from the discard pile into their hand (if any).'
  },
  'evt-08': {
    targetText: 'Report Author',
    description: 'On your next turn, you may deploy any vulnerability onto the table ignoring program scope restrictions.'
  },
  'evt-09': {
    targetText: 'All Players',
    description: 'All players discard their deployed vulnerabilities on the table and receive compensation by rarity ($1k Common/Uncommon, $2k Rare, $2.5k Epic, $3k Legendary). Players with an empty table suffer no effect.'
  },
  'evt-10': {
    targetText: 'Report Author / Table',
    description: 'Active for 1 full round (discard at the start of your next turn). Any player who completes a successful Report gains a +$1,500 bonus on the Bounty Track.'
  },
  'evt-11': {
    targetText: 'All Players',
    description: 'INJ class vulnerabilities cannot be deployed onto the table for 1 full round.'
  },
  'evt-12': {
    targetText: 'Player with Highest Bounty (Leader)',
    description: 'The player with the highest balance on the Bounty Track discards their active program, draws the top card from the Program Deck, and discards any deployed vulnerabilities that become out of scope.'
  },
  'evt-13': {
    targetText: 'All Players',
    description: 'All players with valid vulnerabilities on the table may perform 1 immediate Report without rolling dice (does not draw Tool or Event), in turn order.'
  },
  'evt-14': {
    targetText: 'Choose 1 Opponent',
    description: 'Choose 1 opponent: they must discard 2 random cards from their hand (in a 2-player game, they discard only 1 card).'
  },
  'evt-15': {
    targetText: 'All Players',
    description: 'Defense cards (Safeguards) are blocked for 1 full round (takes effect immediately, including against patches in the same turn).'
  },
  'evt-16': {
    targetText: 'All Players',
    description: 'All players discard their lowest-CVSS vulnerability deployed on the table (players with an empty table suffer no effect).'
  },
  'evt-17': {
    targetText: 'Player in Last Place',
    description: 'The player with the lowest balance on the Bounty Track receives a +$1,500 bonus on their next successful Report.'
  },
  'evt-18': {
    targetText: 'All Players',
    description: 'All players are blocked from performing the Recon action (drawing cards) on their next turn.'
  },
  'evt-19': {
    targetText: 'All Players',
    description: 'Authentication (AUTH) class vulnerabilities cannot be deployed onto the table for 1 full round.'
  },
  'evt-20': {
    targetText: 'All Players',
    description: 'Community networking! All players immediately draw 2 cards from the Main Deck.'
  },
  'evt-21': {
    targetText: 'All Players',
    description: 'Discard and replace the exposed market programs. If at least one allows ALL scope classes, all players advance +$500 on the Bounty Track.'
  },
  'evt-22': {
    targetText: 'All Players',
    description: 'Compliance sweep! All players reveal their hand and discard their highest-CVSS card.'
  },
  'evt-23': {
    targetText: 'All Players',
    description: 'Sponsor swag! Every player draws 1 Tool Card from the Tool Deck.'
  },
  'evt-24': {
    name: 'Ethical Bounty',
    targetText: 'All Players',
    description: 'Every player with zero Alert Tokens on their mat immediately receives a +$1,500 ethical conduct bonus on the Bounty Track.'
  }
};

export const getLocalizedEvent = (
  eventCard: { id?: string; name?: string; enName?: string; title?: string; targetText?: string; simpleDescription?: string; ptDescription?: string } | null | undefined,
  language: Language
) => {
  if (!eventCard) return { name: '', targetText: '', description: '', simpleDescription: '' };
  const rawName = eventCard.name || eventCard.title || '';
  const rawTarget = eventCard.targetText || '';
  const rawDesc = eventCard.simpleDescription || eventCard.ptDescription || '';

  if (language === 'pt') {
    return { name: rawName, targetText: rawTarget, description: rawDesc, simpleDescription: rawDesc };
  }

  const baseId = (eventCard.id || '').toLowerCase().replace(/-copy-\d+$/, '');
  const en = EVENT_EN[baseId];
  if (en) {
    return {
      name: en.name || eventCard.enName || rawName,
      targetText: en.targetText,
      description: en.description,
      simpleDescription: en.description
    };
  }
  return {
    name: eventCard.enName || rawName,
    targetText: rawTarget,
    description: rawDesc,
    simpleDescription: rawDesc
  };
};

const MILESTONE_EN: Record<number, string> = {
  4500: 'First Headline: Gain 1 Reputation Token (🐝)',
  9000: "On Security's Radar: Receive 1 Alert Token (🐞)",
  13500: 'VIP Invite: Gain 1 Reputation Token (🐝) and draw 1 card from the Main Deck',
  19000: 'Exposed Trail: Receive 1 Alert Token (🐞) and discard 1 card from your hand',
  24500: 'Elite Sponsorship: Install 1 Tool immediately with no discard cost',
  29000: 'Conference Star: Gain 1 Reputation Token (🐝) and remove 1 Alert Token',
  33500: 'Tax Bite: Penalty, lose $1,500 on the Bounty Track',
  38000: 'Public Bug Enemy #1: Receive 1 Alert Token (🐞)',
  40000: 'Victory Goal Reached!'
};

export const getLocalizedMilestone = (
  milestone: BountyMilestone,
  language: Language
): { label: string; effectDescription: string } => {
  if (language === 'pt') {
    return { label: milestone.label, effectDescription: milestone.effectDescription };
  }
  return {
    label: milestone.label,
    effectDescription: MILESTONE_EN[milestone.value] || milestone.effectDescription
  };
};

export const getLocalizedPlayerName = (name: string | undefined, language: Language): string => {
  if (!name) return '';
  if (language === 'pt') return name;
  return name
    .replace(/Jogador (\d+)/g, 'Player $1')
    .replace(/\(Verde\)/g, '(Green)')
    .replace(/\(Azul\)/g, '(Blue)')
    .replace(/\(Roxo\)/g, '(Purple)')
    .replace(/\(Laranja\)/g, '(Orange)')
    .replace(/\(Vermelho\)/g, '(Red)')
    .replace(/\(Ciano\)/g, '(Cyan)')
    .replace(/\(Você\)/g, '(You)');
};

export const getLocalizedDynamicText = (text: string | null | undefined, language: Language): string => {
  if (!text) return '';
  if (language === 'pt') return text;

  // Translate well-known dynamic state strings from BoardGameContext
  if (text.includes('REPORT CONCLUÍDO!')) {
    return '🎯 REPORT COMPLETED! Choose your new Program (1 of the 3 exposed OR Surprise from Deck):';
  }
  if (text.includes('PATCH SOFRIDO!')) {
    return '💥 PATCH SUFFERED! Immediately choose your new Program (1 of the 3 exposed OR Surprise from Deck) before ending your turn:';
  }
  if (text.includes('FuzzStorm Ativado')) {
    return '🌩️ FuzzStorm Activated: Inspect Top 3 of Main Deck';
  }
  if (text.includes('Escolha 1 carta para comprar para a mão')) {
    return 'Choose 1 card to draw into your hand and order the other 2 on top of the Main Deck';
  }
  if (text.includes('Hex Kitchen Ativada')) {
    return '🍳 Hex Kitchen Activated: Decode the Event Deck';
  }
  if (text.includes('Escolha 1 Evento para descartar')) {
    return 'Choose 1 Event to discard and set the order of the other 2 on top of the Event Deck';
  }
  if (text.includes('Throne Room (#BAC-14)')) {
    return '👑 Throne Room (#BAC-14): Event Deck Inspection';
  }
  if (text.includes('Escolha até 1 Evento para descartar')) {
    return 'Choose up to 1 Event to discard and order the remaining ones on top of the Event Deck';
  }
  if (text.includes('n00b (Garimpeiro de Ferramentas)')) {
    return '🌱 n00b (Tool Prospector): Choose your Tool!';
  }
  if (text.includes('Olhe as 3 primeiras cartas do Tool Deck')) {
    return 'Look at the top 3 cards of the Tool Deck, choose 1 for your hand, and return the other 2 to the bottom';
  }

  return getLocalizedPlayerName(text, 'en');
};
