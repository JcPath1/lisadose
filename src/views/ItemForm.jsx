import { useState } from 'react'
import { CATEGORIES, FREQUENCIES, DAYS, createId, formatDate, calcSyringe } from '../store'

function ItemForm({ item, onSave, onDelete, onClose }) {
  const isNew = !item.id
  const [name, setName] = useState(item.name || '')
  const [category, setCategory] = useState(item.category || 'peptide')
  const [dose, setDose] = useState(item.dose || '')
  const [unit, setUnit] = useState(item.unit || 'mg')
  const [frequency, setFrequency] = useState(item.frequency || 'daily')
  const [days, setDays] = useState(item.days || [])
  const [time, setTime] = useState(item.time || '')
  const [description, setDescription] = useState(item.description || '')
  const [vialStrength, setVialStrength] = useState(item.vialStrength || '')
  const [bacWater, setBacWater] = useState(item.bacWater || '')
  const [paused, setPaused] = useState(item.paused || false)
  const [notes, setNotes] = useState(item.notes || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const result = calcSyringe(dose, unit, vialStrength, bacWater)

  function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      id: item.id || createId(),
      name: name.trim(),
      category,
      description: description.trim(),
      dose,
      unit,
      frequency,
      days: frequency !== 'daily' ? days : [],
      time,
      vialStrength,
      bacWater,
      paused,
      notes: notes.trim(),
      startDate: item.startDate || formatDate(new Date()),
    })
  }

  function toggleDay(d) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  return (
    <div className="app">
      <div className="app-content">
        <div className="top-bar">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>{isNew ? 'Add Item' : 'Edit Item'}</h1>
          <button className="btn btn-ghost" style={{ color: 'var(--accent)' }} onClick={handleSave}>Save</button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. BPC-157, Vitamin D, Testosterone..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              className={`status-toggle ${paused ? 'paused' : 'active'}`}
              onClick={() => setPaused(!paused)}
            >
              <span className="status-dot" />
              {paused ? 'Paused — won\'t show on schedule' : 'Active — showing on schedule'}
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is it used for? e.g. Joint healing, muscle recovery..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Dose</label>
              <input
                type="text"
                value={dose}
                onChange={e => setDose(e.target.value)}
                placeholder="250"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="mg">mg</option>
                <option value="mcg">mcg</option>
                <option value="ml">ml</option>
                <option value="IU">IU</option>
                <option value="g">g</option>
                <option value="caps">caps</option>
                <option value="tabs">tabs</option>
                <option value="drops">drops</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Vial Strength (mg)</label>
              <input
                type="number"
                step="any"
                value={vialStrength}
                onChange={e => setVialStrength(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">BAC Water (mL)</label>
              <input
                type="number"
                step="any"
                value={bacWater}
                onChange={e => setBacWater(e.target.value)}
                placeholder="3"
              />
            </div>
          </div>

          {result && (
            <div className="form-calc-preview card" style={{ marginBottom: 16, background: 'var(--bg)', border: '1px solid var(--accent)33' }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Syringe Preview
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Draw to <strong style={{ color: 'var(--accent)' }}>{result.syringeUnits} units</strong></span>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>{result.dosesPerVial} doses/vial</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}>
              {FREQUENCIES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {frequency !== 'daily' && (
            <div className="form-group">
              <label className="form-label">Days</label>
              <div className="day-picker">
                {DAYS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`day-chip ${days.includes(i) ? 'selected' : ''}`}
                    onClick={() => toggleDay(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Time of Day (optional)</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Injection site, take with food, etc."
            />
          </div>

          {onDelete && !confirmDelete && (
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ color: 'var(--red)', marginBottom: 24 }}
              onClick={() => setConfirmDelete(true)}
            >
              Delete Item
            </button>
          )}

          {onDelete && confirmDelete && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => onDelete(item.id)}
              >
                Confirm Delete
              </button>
            </div>
          )}
        </form>

        <style>{`
          .status-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
          }
          .status-toggle.active {
            background: rgba(52, 211, 153, 0.15);
            color: var(--green);
          }
          .status-toggle.paused {
            background: var(--surface2);
            color: var(--text2);
          }
          .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .status-toggle.active .status-dot {
            background: var(--green);
          }
          .status-toggle.paused .status-dot {
            background: var(--text2);
          }
        `}</style>
      </div>
    </div>
  )
}

export default ItemForm
