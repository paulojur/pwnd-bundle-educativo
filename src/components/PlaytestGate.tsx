import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

// Hash SHA-256 padrão para a senha inicial: "pwnd-playtest-2026"
// Para trocar a senha, basta gerar o SHA-256 da nova palavra e substituir aqui ou no .env
const DEFAULT_HASH = 'f767c90682b46e5ea8e2ac63665e4cedae435846d5be5fa0803fd0d5d831364d';
const AUTH_STORAGE_KEY = 'pwnd_playtest_auth_token_v1';

async function computeSHA256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface PlaytestGateProps {
  children: React.ReactNode;
}

export const PlaytestGate: React.FC<PlaytestGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (saved === 'granted') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError('Por favor, informe a chave de acesso.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const inputHash = await computeSHA256(passwordInput);
      const expectedHash = (import.meta as any).env?.VITE_PLAYTEST_HASH || DEFAULT_HASH;

      if (inputHash === expectedHash) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'granted');
        setIsAuthenticated(true);
      } else {
        setError('Acesso negado: Chave de segurança inválida.');
      }
    } catch (err) {
      setError('Falha ao validar credencial criptográfica.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: '#0a0d14',
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(57, 211, 83, 0.08) 0%, transparent 60%),
            linear-gradient(180deg, #07090e 0%, #0d111a 100%)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          color: '#e6edf3'
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            background: '#111522',
            border: '2px solid #222d42',
            borderRadius: '14px',
            padding: '36px 28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(57, 211, 83, 0.15)',
            position: 'relative'
          }}
        >
          {/* Header Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(57, 211, 83, 0.12)',
                border: '1px solid #39d353',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(57, 211, 83, 0.3)'
              }}
            >
              <Lock size={32} color="#39d353" />
            </div>
          </div>

          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(240, 136, 62, 0.15)',
                color: '#f0883e',
                border: '1px solid rgba(240, 136, 62, 0.4)',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1px'
              }}
            >
              <ShieldAlert size={13} />
              PLAYTEST PRIVADO • PROTÓTIPO
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '900',
              textAlign: 'center',
              color: '#ffffff',
              marginBottom: '8px',
              letterSpacing: '1px'
            }}
          >
            PWNED! — Acesso Restrito
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '28px',
              fontFamily: 'var(--font-sans, sans-serif)'
            }}
          >
            Este ambiente contém materiais e mecânicas proprietárias sob teste. O acesso é exclusivo para playtesters e parceiros autorizados.
          </p>

          <form onSubmit={handleUnlock}>
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  display: 'flex'
                }}
              >
                <KeyRound size={18} />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Insira a chave do playtest..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 42px',
                  background: '#090c13',
                  border: error ? '1px solid #f85149' : '1px solid #2d3748',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '4px'
                }}
                title={showPassword ? 'Ocultar' : 'Exibir'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div
                style={{
                  color: '#f85149',
                  fontSize: '12px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  background: 'rgba(248, 81, 73, 0.1)',
                  border: '1px solid rgba(248, 81, 73, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: '100%',
                padding: '14px',
                background: '#39d353',
                color: '#07090e',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '14px',
                fontFamily: 'var(--font-mono, monospace)',
                cursor: isVerifying ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 15px rgba(57, 211, 83, 0.35)',
                transition: 'opacity 0.2s'
              }}
            >
              {isVerifying ? 'Autenticando...' : (
                <>
                  <span>Desbloquear Playtest</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #1a2234',
              textAlign: 'center',
              fontSize: '11px',
              color: '#64748b'
            }}
          >
            PWNED! Bug Bounty Chaos &bull; Todos os direitos reservados.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Watermark Overlay for On-Screen Playtest */}
      <div
        className="playtest-screen-watermark"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='240' viewBox='0 0 420 240'><text x='50%' y='50%' text-anchor='middle' fill='%23ffffff' font-family='monospace' font-weight='bold' font-size='13' transform='rotate(-25 210 120)'>PWNED! PROTÓTIPO EM TESTE • CÓPIA PROIBIDA</text></svg>")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Discret top security badge */}
      <div
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '12px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(240, 136, 62, 0.4)',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '10px',
          fontFamily: 'var(--font-mono, monospace)',
          color: '#f0883e',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'auto',
          backdropFilter: 'blur(4px)'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#39d353' }}></span>
        <span>PLAYTEST PRIVADO (V1.4)</span>
        <button
          onClick={() => {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            window.location.reload();
          }}
          title="Bloquear sessão de playtest"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '10px',
            textDecoration: 'underline',
            marginLeft: '4px'
          }}
        >
          sair
        </button>
      </div>

      {children}
    </>
  );
};
