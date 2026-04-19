import { useState, useEffect } from 'react'

const PIN_KEY = 'lisadose_pin'
const SESSION_KEY = 'lisadose_unlocked'

export function hasPin() {
  return !!localStorage.getItem(PIN_KEY)
}

export function isUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function lockApp() {
  sessionStorage.removeItem(SESSION_KEY)
}

function PinLock({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [mode, setMode] = useState(hasPin() ? 'enter' : 'create') // 'create', 'confirm', 'enter'
  const [newPin, setNewPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const title = mode === 'create' ? 'Create PIN'
    : mode === 'confirm' ? 'Confirm PIN'
    : 'Enter PIN'

  const subtitle = mode === 'create' ? 'Choose a 6-digit PIN to protect your data'
    : mode === 'confirm' ? 'Enter your PIN again to confirm'
    : ''

  useEffect(() => {
    if (pin.length === 6) {
      if (mode === 'create') {
        setNewPin(pin)
        setPin('')
        setMode('confirm')
        setError('')
      } else if (mode === 'confirm') {
        if (pin === newPin) {
          localStorage.setItem(PIN_KEY, pin)
          sessionStorage.setItem(SESSION_KEY, 'true')
          onUnlock()
        } else {
          triggerError("PINs don't match. Try again.")
          setMode('create')
          setNewPin('')
        }
      } else {
        const stored = localStorage.getItem(PIN_KEY)
        if (pin === stored) {
          sessionStorage.setItem(SESSION_KEY, 'true')
          onUnlock()
        } else {
          triggerError('Wrong PIN')
        }
      }
    }
  }, [pin])

  function triggerError(msg) {
    setError(msg)
    setShake(true)
    setPin('')
    setTimeout(() => setShake(false), 500)
  }

  function handleNum(n) {
    if (pin.length < 6) setPin(prev => prev + n)
  }

  function handleDelete() {
    setPin(prev => prev.slice(0, -1))
    setError('')
  }

  return (
    <div className="pin-screen">
      <div className="pin-content">
        <div className="pin-title">{title}</div>
        {subtitle && <div className="pin-subtitle">{subtitle}</div>}

        <div className={`pin-dots ${shake ? 'shake' : ''}`}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>

        {error && <div className="pin-error">{error}</div>}

        <div className="pin-pad">
          {[1,2,3,4,5,6,7,8,9,null,0,'del'].map((n, i) => {
            if (n === null) return <div key={i} className="pin-key empty" />
            if (n === 'del') return (
              <button key={i} className="pin-key" onClick={handleDelete}>
                &#9003;
              </button>
            )
            return (
              <button key={i} className="pin-key" onClick={() => handleNum(String(n))}>
                {n}
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        .pin-screen {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
        }
        .pin-content {
          text-align: center;
          width: 100%;
          max-width: 320px;
          padding: 20px;
        }
        .pin-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .pin-subtitle {
          font-size: 14px;
          color: var(--text2);
          margin-bottom: 24px;
        }
        .pin-dots {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin: 24px 0;
        }
        .pin-dots.shake {
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .pin-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--text2);
          transition: all 0.15s;
        }
        .pin-dot.filled {
          background: var(--accent);
          border-color: var(--accent);
        }
        .pin-error {
          color: var(--red);
          font-size: 14px;
          margin-bottom: 16px;
        }
        .pin-pad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          max-width: 260px;
          margin: 0 auto;
        }
        .pin-key {
          height: 60px;
          border-radius: 50%;
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .pin-key:active {
          background: var(--surface2);
        }
        .pin-key.empty {
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default PinLock
