import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Dices, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { getPatchThreshold } from '../utils/gameRulesV14';

interface DiceRollerProps {
  programName: string;
  patchSpeed: string;
  isNoisy: boolean;
  playerReputationTokens?: number;
  hasBypass?: boolean;
  onUseReputationReroll?: () => void;
  onDefusePatch?: () => void;
  onAcceptPatch?: () => void;
  onRollComplete: (result: {
    diceValues: number[];
    discardedDie?: number;
    evaluatedSum: number;
    threshold: number;
    passed: boolean;
  }) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  programName,
  patchSpeed,
  isNoisy,
  playerReputationTokens = 0,
  hasBypass = false,
  onUseReputationReroll,
  onDefusePatch,
  onAcceptPatch,
  onRollComplete
}) => {
  const [rolling, setRolling] = useState<boolean>(false);
  const [dice, setDice] = useState<number[]>(isNoisy ? [1, 1] : [1, 1, 1]);
  const [rolled, setRolled] = useState<boolean>(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [discardedIndex, setDiscardedIndex] = useState<number | null>(null);
  const [evaluatedSum, setEvaluatedSum] = useState<number>(0);

  const threshold = getPatchThreshold(patchSpeed);

  const rollAllDice = () => {
    soundFx.playClick();
    setRolling(true);
    setRolled(false);

    let count = 0;
    const interval = setInterval(() => {
      if (isNoisy) {
        setDice([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]);
      } else {
        setDice([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]);
      }
      count++;

      if (count > 10) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 70);
  };

  const finalizeRoll = (overrideDice?: number[]) => {
    const finalDice = overrideDice || (isNoisy
      ? [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
      : [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
    );

    setDice(finalDice);

    let sum = 0;
    let discIdx: number | null = null;

    if (isNoisy) {
      sum = finalDice[0] + finalDice[1];
    } else {
      let maxVal = -1;
      let maxIdx = 0;
      finalDice.forEach((val, idx) => {
        if (val > maxVal) {
          maxVal = val;
          maxIdx = idx;
        }
      });
      discIdx = maxIdx;
      setDiscardedIndex(maxIdx);
      sum = finalDice.filter((_, idx) => idx !== maxIdx).reduce((a, b) => a + b, 0);
    }

    setEvaluatedSum(sum);
    const isSafe = sum < threshold;
    setPassed(isSafe);
    setRolling(false);
    setRolled(true);

    if (!isSafe) {
      soundFx.playPatchDeployedAlarm();
    }
  };

  const handleRerollDie = (dieIndex: number) => {
    if (playerReputationTokens < 2) return;
    soundFx.playClick();
    if (onUseReputationReroll) {
      onUseReputationReroll();
    }

    const newDice = [...dice];
    newDice[dieIndex] = Math.floor(Math.random() * 6) + 1;
    finalizeRoll(newDice);
  };

  const handleConfirmResult = () => {
    if (passed === null) return;
    onRollComplete({
      diceValues: dice,
      discardedDie: discardedIndex !== null ? dice[discardedIndex] : undefined,
      evaluatedSum,
      threshold,
      passed
    });
  };

  const getD6Svg = (val: number, isDiscarded: boolean) => {
    return (
      <div
        style={{
          width: '64px',
          height: '64px',
          background: isDiscarded ? 'rgba(40, 40, 40, 0.4)' : '#181e2b',
          border: isDiscarded ? '2px dashed #666' : '2px solid var(--accent, #00ff66)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDiscarded ? 'none' : '0 0 15px rgba(0, 255, 102, 0.25)',
          opacity: isDiscarded ? 0.45 : 1,
          position: 'relative',
          userSelect: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '32px',
            fontWeight: '900',
            color: isDiscarded ? '#888' : '#fff',
            textDecoration: isDiscarded ? 'line-through' : 'none'
          }}
        >
          {val}
        </span>
        {isDiscarded && (
          <span
            style={{
              position: 'absolute',
              bottom: '2px',
              fontSize: '9px',
              fontFamily: 'monospace',
              color: '#ff4444',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            DESCARTADO
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div
        className="terminal-box"
        style={{
          maxWidth: '520px',
          width: '92%',
          padding: '28px',
          textAlign: 'center',
          border: '2px solid #242b3a',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.8)',
          background: '#0e121a'
        }}
      >
        <div
          style={{
            margin: '0 auto 12px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isNoisy ? 'rgba(255, 51, 75, 0.15)' : 'rgba(0, 229, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isNoisy ? '#ff334b' : '#00e5ff'}`
          }}
        >
          <Dices size={34} color={isNoisy ? '#ff334b' : '#00e5ff'} />
        </div>

        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: isNoisy ? '#ff5566' : '#00e5ff',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '4px',
            fontWeight: 'bold'
          }}
        >
          {isNoisy ? '⚡ PATCH SPEED CHECK — MODO NOISY (2D6)' : '🥷 PATCH SPEED CHECK — MODO STEALTH (3D6)'}
        </div>

        <h3
          style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#fff',
            fontFamily: 'monospace',
            margin: '4px 0 10px 0'
          }}
        >
          {programName}
        </h3>

        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '20px',
            lineHeight: '1.6',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            Velocidade: <strong style={{ color: '#fff' }}>{patchSpeed}</strong> | Limiar de Patch:{' '}
            <strong style={{ color: '#ff334b' }}>{threshold}+</strong> (Soma D6)
          </div>
          <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
            {isNoisy
              ? 'Modo Noisy: Rola 2D6 e soma os valores. Se a soma for igual ou maior que o limiar, o Patch dispara!'
              : 'Modo Stealth: Rola 3D6, descarta o maior valor e soma os 2 menores.'}
          </div>
        </div>

        {/* Dice Row Display */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            margin: '24px 0'
          }}
        >
          {dice.map((d, idx) => {
            const isDiscarded = !isNoisy && rolled && discardedIndex === idx;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                {getD6Svg(d, isDiscarded)}
                {rolled && playerReputationTokens >= 2 && !rolling && (
                  <button
                    onClick={() => handleRerollDie(idx)}
                    style={{
                      background: 'rgba(255, 184, 0, 0.15)',
                      border: '1px solid #ffb800',
                      color: '#ffb800',
                      borderRadius: '4px',
                      padding: '3px 6px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                    title="Gastar 2 Tokens de Reputação (🐝) para rerrolar este dado"
                  >
                    <RefreshCw size={10} /> Reroll (2🐝)
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Calculation Result */}
        {rolled && (
          <div style={{ margin: '16px 0', padding: '12px', borderRadius: '8px', background: passed ? 'rgba(0, 255, 102, 0.08)' : 'rgba(255, 51, 75, 0.1)', border: `1px solid ${passed ? '#00ff66' : '#ff334b'}` }}>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#fff', marginBottom: '6px' }}>
              Soma Avaliada:{' '}
              <strong style={{ fontSize: '18px', color: passed ? '#00ff66' : '#ff334b' }}>{evaluatedSum}</strong>{' '}
              vs Limiar <strong>{threshold}</strong>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {passed ? (
                <span style={{ color: '#00ff66', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldCheck size={20} /> SISTEMA PERMANECE VULNERÁVEL! (Resultado Seguro)
                </span>
              ) : (
                <span style={{ color: '#ff334b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldAlert size={20} /> ⚠️ PATCH DEPLOYED! (Alerta & Perda de Ativos)
                </span>
              )}
            </div>

            {playerReputationTokens >= 2 && !passed && (
              <div style={{ fontSize: '11px', color: '#ffb800', marginTop: '6px' }}>
                💡 Você possui {playerReputationTokens} 🐝 Tokens! Pode clicar no botão "Reroll" acima de qualquer dado para tentar escapar do Patch.
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {!rolled ? (
            <button
              onClick={rollAllDice}
              disabled={rolling}
              style={{
                flex: 1,
                padding: '14px',
                background: isNoisy ? '#ff334b' : '#00ff66',
                color: isNoisy ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Dices size={18} /> {rolling ? 'Rolando Dados D6...' : `Rolar Dados de Patch (${isNoisy ? '2D6' : '3D6'})`}
            </button>
          ) : passed ? (
            <button
              onClick={handleConfirmResult}
              style={{
                flex: 1,
                padding: '14px',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '900',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)'
              }}
            >
              Confirmar Sucesso & Receber Payout ✅
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
              {hasBypass && onDefusePatch && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onDefusePatch();
                  }}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    padding: '12px',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: '1.5px solid #2B2620',
                    borderRadius: '6px',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)'
                  }}
                  title="Anula o descarte dos seus exploits, garante o Payout e descarta o Bypass (+1 Alerta)"
                >
                  🛡️ Ativar Bypass (Garante Payout!)
                </button>
              )}

              <button
                onClick={() => {
                  soundFx.playClick();
                  if (onAcceptPatch) {
                    onAcceptPatch();
                  } else {
                    handleConfirmResult();
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '12px',
                  background: '#B91C1C',
                  color: '#FFFFFF',
                  border: '1.5px solid #2B2620',
                  borderRadius: '6px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(185, 28, 28, 0.4)'
                }}
                title="Descarta seus exploits e programa ativo, recebe 1 Alerta e compra 1 consolação"
              >
                💥 Aceitar Patch (+1 Alerta 🐞)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
