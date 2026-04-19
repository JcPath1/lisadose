import { useMemo } from 'react'
import { isDueOnDate, CATEGORIES, formatDate, parseDate, calcSyringe } from '../store'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function Today({ items, logs, date, onToggle, onDateChange, onCalc, onExport }) {
  const d = parseDate(date)
  const todayStr = formatDate(new Date())
  const isToday = date === todayStr

  const dueItems = useMemo(() => {
    const due = items.filter(item => isDueOnDate(item, date, logs))
    // Step 1: bedtime to the bottom, alphabetized (CJC draws before Ipamorelin)
    const bedSorted = [...due].sort((a, b) => {
      const bedDiff = (a.bedtime ? 1 : 0) - (b.bedtime ? 1 : 0)
      if (bedDiff !== 0) return bedDiff
      if (a.bedtime && b.bedtime) return (a.name || '').localeCompare(b.name || '')
      return 0
    })
    // Step 2: cluster stackGroup members next to each other (preserves surrounding order)
    const result = []
    const seen = new Set()
    for (const item of bedSorted) {
      if (seen.has(item.id)) continue
      result.push(item)
      seen.add(item.id)
      if (item.stackGroup) {
        for (const other of bedSorted) {
          if (seen.has(other.id)) continue
          if (other.stackGroup === item.stackGroup) {
            result.push(other)
            seen.add(other.id)
          }
        }
      }
    }
    return result
  }, [items, date, logs])

  const doneCount = dueItems.filter(item => logs[`${item.id}:${date}`]).length

  function shiftDate(offset) {
    const next = parseDate(date)
    next.setDate(next.getDate() + offset)
    onDateChange(formatDate(next))
  }

  const catColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || 'var(--text2)'

  return (
    <div>
      <div className="top-bar">
        <button className="nav-arrow" onClick={() => shiftDate(-1)}>&#8249;</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {isToday ? 'Today' : DAY_NAMES[d.getDay()]}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {MONTH_NAMES[d.getMonth()]} {d.getDate()}, {d.getFullYear()}
          </div>
        </div>
        <button className="nav-arrow" onClick={() => shiftDate(1)}>&#8250;</button>
      </div>

      {dueItems.length > 0 && (
        <div className="progress-bar-wrap">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${dueItems.length ? (doneCount / dueItems.length) * 100 : 0}%` }}
            />
          </div>
          <span className="progress-text">{doneCount}/{dueItems.length}</span>
        </div>
      )}

      {dueItems.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40 }}>&#10003;</div>
          <p>Nothing scheduled for this day</p>
        </div>
      ) : (
        <div className="dose-list">
          {dueItems.map(item => {
            const done = !!logs[`${item.id}:${date}`]
            const syringe = calcSyringe(item.dose, item.unit, item.vialStrength, item.bacWater)
            return (
              <div key={item.id} className={`dose-card card ${done ? 'done' : ''} ${item.bedtime ? 'bedtime' : ''}`}>
                <button
                  className="dose-main"
                  onClick={() => onToggle(item.id, date)}
                >
                  <div className="dose-check">
                    <div className={`check-circle ${done ? 'checked' : ''}`}
                      style={{ borderColor: done ? 'var(--green)' : catColor(item.category) }}
                    >
                      {done && <span>&#10003;</span>}
                    </div>
                  </div>
                  <div className="dose-info">
                    <div className="dose-name">{item.name}</div>
                    <div className="dose-detail">
                      <span className="badge" style={{
                        background: catColor(item.category) + '22',
                        color: catColor(item.category)
                      }}>
                        {item.category}
                      </span>
                      {item.dose && (
                        <span className="dose-amount">{item.dose} {item.unit || ''}</span>
                      )}
                      {item.time && (
                        <span className="dose-time">{item.time}</span>
                      )}
                    </div>
                    {syringe && (
                      <div className="syringe-info">
                        Draw to <strong>{syringe.syringeUnits} units</strong>
                        <span className="syringe-detail"> ({syringe.mlToDraw} mL)</span>
                      </div>
                    )}
                    {item.description && <div className="dose-desc">{item.description}</div>}
                    {item.notes && <div className="dose-notes">{item.notes}</div>}
                  </div>
                </button>
                {syringe && (
                  <button
                    className="calc-link"
                    onClick={(e) => { e.stopPropagation(); onCalc(item) }}
                    title="Open calculator"
                  >
                    ◎
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!isToday && (
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 16, marginBottom: 16 }}
          onClick={() => onDateChange(todayStr)}
        >
          Back to Today
        </button>
      )}

      {isToday && onExport && (
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 16, marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}
          onClick={onExport}
        >
          Backup Data
        </button>
      )}

      <style>{`
        .nav-arrow {
          font-size: 28px;
          padding: 8px 14px;
          color: var(--text2);
          border-radius: 8px;
        }
        .nav-arrow:active { background: var(--surface); }
        .progress-bar-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .progress-bar {
          flex: 1;
          height: 6px;
          background: var(--surface2);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--green);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--text2);
          min-width: 36px;
          text-align: right;
        }
        .dose-list { padding-bottom: 16px; }
        .dose-card {
          display: flex;
          align-items: flex-start;
          gap: 0;
          width: 100%;
          text-align: left;
          transition: opacity 0.2s;
          position: relative;
        }
        .dose-card.done { opacity: 0.55; }
        .dose-card.bedtime {
          background: #2a1f4a;
          border-left: 3px solid var(--purple);
        }
        .dose-card.bedtime .dose-name::after {
          content: 'BEDTIME';
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: var(--purple);
          background: rgba(167, 139, 250, 0.15);
          padding: 2px 7px;
          border-radius: 10px;
          margin-left: 8px;
          vertical-align: middle;
        }
        .dose-main {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          background: none;
          border: none;
          color: inherit;
          font: inherit;
          text-align: left;
          padding: 0;
          cursor: pointer;
          min-width: 0;
        }
        .dose-main:active { opacity: 0.8; }
        .check-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--green);
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .check-circle.checked {
          background: var(--green);
          color: var(--bg);
        }
        .dose-info { flex: 1; min-width: 0; }
        .dose-name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .dose-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dose-amount, .dose-time {
          font-size: 13px;
          color: var(--text2);
        }
        .syringe-info {
          font-size: 13px;
          color: var(--accent);
          margin-top: 4px;
        }
        .syringe-detail {
          color: var(--text2);
          font-weight: 400;
        }
        .dose-desc {
          font-size: 12px;
          color: var(--text2);
          margin-top: 4px;
        }
        .dose-notes {
          font-size: 12px;
          color: var(--text2);
          margin-top: 2px;
          font-style: italic;
        }
        .calc-link {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 18px;
          color: var(--text2);
          padding: 4px;
          border-radius: 4px;
          line-height: 1;
        }
        .calc-link:active { color: var(--accent); }
      `}</style>
    </div>
  )
}

export default Today
