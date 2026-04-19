import { CATEGORIES, FREQUENCIES, calcSyringe } from '../store'

function Items({ items, onEdit, onAdd, onExport, onImport }) {
  const catColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || 'var(--text2)'
  const freqLabel = (f) => FREQUENCIES.find(fr => fr.value === f)?.label || f

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title" style={{ margin: 0 }}>My Items</h1>
        <button className="btn btn-primary" onClick={onAdd}>+ Add</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40 }}>+</div>
          <p>Add your first peptide, supplement, or medication</p>
        </div>
      ) : (
        <div style={{ paddingBottom: 16 }}>
          {items.map(item => {
            const syringe = calcSyringe(item.dose, item.unit, item.vialStrength, item.bacWater)
            return (
              <button
                key={item.id}
                className="card item-card"
                onClick={() => onEdit(item)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div className="item-dot" style={{ background: item.paused ? 'var(--text2)' : catColor(item.category) }} />
                  <span style={{ fontWeight: 600, fontSize: 15, opacity: item.paused ? 0.5 : 1 }}>{item.name}</span>
                  {item.paused && (
                    <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text2)', fontSize: 10 }}>
                      PAUSED
                    </span>
                  )}
                </div>
                {item.description && (
                  <div style={{ fontSize: 13, color: 'var(--text2)', paddingLeft: 22, marginBottom: 4 }}>
                    {item.description}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 22 }}>
                  <span className="badge" style={{
                    background: catColor(item.category) + '22',
                    color: catColor(item.category)
                  }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                    {item.dose} {item.unit || ''}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                    {freqLabel(item.frequency)}
                  </span>
                  {syringe && (
                    <span style={{ fontSize: 13, color: 'var(--accent)' }}>
                      {syringe.syringeUnits} units
                    </span>
                  )}
                </div>
                {item.vialStrength && (
                  <div style={{ fontSize: 12, color: 'var(--text2)', paddingLeft: 22, marginTop: 4 }}>
                    Vial: {item.vialStrength}mg / {item.bacWater}mL BAC
                    {syringe && <span> / {syringe.dosesPerVial} doses per vial</span>}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, padding: '8px 0 16px' }}>
        <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={onExport}>
          Backup Data
        </button>
        <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={onImport}>
          Restore Backup
        </button>
      </div>

      <style>{`
        .item-card {
          width: 100%;
          text-align: left;
          transition: opacity 0.2s;
        }
        .item-card:active { opacity: 0.8; }
        .item-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

export default Items
