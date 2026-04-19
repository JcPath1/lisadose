import { useState, useEffect, useMemo } from 'react'
import { calcSyringe } from '../store'

function Calculator({ items, preselect, onClearPreselect }) {
  const [selectedId, setSelectedId] = useState('')
  const [dose, setDose] = useState('')
  const [unit, setUnit] = useState('mcg')
  const [vialStrength, setVialStrength] = useState('')
  const [bacWater, setBacWater] = useState('')

  // Auto-fill from preselected item or dropdown selection
  useEffect(() => {
    if (preselect) {
      setSelectedId(preselect.id)
      setDose(preselect.dose || '')
      setUnit(preselect.unit || 'mcg')
      setVialStrength(preselect.vialStrength || '')
      setBacWater(preselect.bacWater || '')
      onClearPreselect()
    }
  }, [preselect, onClearPreselect])

  function handleSelect(id) {
    setSelectedId(id)
    if (id) {
      const item = items.find(i => i.id === id)
      if (item) {
        setDose(item.dose || '')
        setUnit(item.unit || 'mcg')
        setVialStrength(item.vialStrength || '')
        setBacWater(item.bacWater || '')
      }
    }
  }

  const result = useMemo(() =>
    calcSyringe(dose, unit, vialStrength, bacWater),
    [dose, unit, vialStrength, bacWater]
  )

  const syringePercent = result ? Math.min((result.syringeUnits / 100) * 100, 100) : 0

  return (
    <div>
      <h1 className="page-title">Dosing Calculator</h1>

      <div className="form-group">
        <label className="form-label">Select Item</label>
        <select value={selectedId} onChange={e => handleSelect(e.target.value)}>
          <option value="">-- Manual Entry --</option>
          {items.filter(i => i.vialStrength).map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Dose</label>
          <input
            type="number"
            step="any"
            value={dose}
            onChange={e => setDose(e.target.value)}
            placeholder="250"
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Unit</label>
          <div className="unit-tabs">
            {['mcg', 'mg'].map(u => (
              <button
                key={u}
                className={`unit-tab ${unit === u ? 'active' : ''}`}
                onClick={() => setUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Vial Strength (mg)</label>
        <div className="preset-row">
          {['5', '10', '15', '20', '30'].map(v => (
            <button
              key={v}
              className={`preset-btn ${vialStrength === v ? 'active' : ''}`}
              onClick={() => setVialStrength(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <input
          type="number"
          step="any"
          value={vialStrength}
          onChange={e => setVialStrength(e.target.value)}
          placeholder="Custom mg"
          style={{ marginTop: 8 }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">BAC Water (mL)</label>
        <div className="preset-row">
          {['1', '2', '3', '5'].map(v => (
            <button
              key={v}
              className={`preset-btn ${bacWater === v ? 'active' : ''}`}
              onClick={() => setBacWater(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <input
          type="number"
          step="any"
          value={bacWater}
          onChange={e => setBacWater(e.target.value)}
          placeholder="Custom mL"
          style={{ marginTop: 8 }}
        />
      </div>

      {result && (
        <div className="calc-result card">
          <div className="syringe-visual">
            <div className="syringe-body">
              <div className="syringe-fill" style={{ width: `${syringePercent}%` }} />
              <div className="syringe-ticks">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(t => (
                  <div key={t} className="tick" style={{ left: `${t}%` }}>
                    <div className="tick-line" />
                    <span className="tick-label">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="syringe-tip" />
          </div>

          <div className="result-grid">
            <div className="result-item">
              <div className="result-value" style={{ color: 'var(--accent)' }}>
                {result.syringeUnits} units
              </div>
              <div className="result-label">Draw to</div>
            </div>
            <div className="result-item">
              <div className="result-value">{result.mlToDraw} mL</div>
              <div className="result-label">Volume</div>
            </div>
            <div className="result-item">
              <div className="result-value">{result.concentration} mg/mL</div>
              <div className="result-label">Concentration</div>
            </div>
            <div className="result-item">
              <div className="result-value">{result.dosesPerVial}</div>
              <div className="result-label">Doses per vial</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .unit-tabs {
          display: flex;
          background: var(--surface2);
          border-radius: 8px;
          overflow: hidden;
          height: 44px;
        }
        .unit-tab {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: var(--text2);
          transition: all 0.15s;
        }
        .unit-tab.active {
          background: var(--accent);
          color: var(--bg);
        }
        .preset-row {
          display: flex;
          gap: 6px;
        }
        .preset-btn {
          flex: 1;
          padding: 10px 4px;
          background: var(--surface2);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text2);
          transition: all 0.15s;
        }
        .preset-btn.active {
          background: var(--accent);
          color: var(--bg);
        }
        .calc-result {
          margin-top: 8px;
          margin-bottom: 20px;
        }
        .syringe-visual {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          gap: 0;
        }
        .syringe-body {
          flex: 1;
          height: 32px;
          background: var(--surface2);
          border-radius: 6px 0 0 6px;
          position: relative;
          overflow: hidden;
          border: 2px solid var(--border);
          border-right: none;
        }
        .syringe-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(56,189,248,0.4), rgba(56,189,248,0.2));
          border-right: 2px solid var(--accent);
          transition: width 0.3s ease;
        }
        .syringe-ticks {
          position: absolute;
          inset: 0;
        }
        .tick {
          position: absolute;
          top: 0;
          bottom: 0;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tick-line {
          width: 1px;
          height: 8px;
          background: var(--border);
        }
        .tick-label {
          font-size: 8px;
          color: var(--text2);
          margin-top: 1px;
        }
        .syringe-tip {
          width: 16px;
          height: 8px;
          background: var(--border);
          border-radius: 0 4px 4px 0;
        }
        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .result-item {
          text-align: center;
          padding: 8px;
          background: var(--bg);
          border-radius: 8px;
        }
        .result-value {
          font-size: 18px;
          font-weight: 700;
        }
        .result-label {
          font-size: 12px;
          color: var(--text2);
          margin-top: 2px;
        }
      `}</style>
    </div>
  )
}

export default Calculator
