import { useState, useMemo } from 'react'
import { isDueOnDate, formatDate, CATEGORIES } from '../store'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function Calendar({ items, logs, onSelectDate }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const calDays = useMemo(() => {
    const first = new Date(year, month, 1)
    const startDay = first.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    for (let i = 0; i < startDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(new Date(year, month, d))
      const due = items.filter(item => isDueOnDate(item, dateStr, logs))
      const done = due.filter(item => logs[`${item.id}:${dateStr}`])
      days.push({ day: d, dateStr, dueCount: due.length, doneCount: done.length, due })
    }
    return days
  }, [year, month, items, logs])

  function shift(dir) {
    let m = month + dir
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m)
    setYear(y)
  }

  const todayStr = formatDate(today)

  return (
    <div>
      <div className="top-bar">
        <button className="cal-nav" onClick={() => shift(-1)}>&#8249;</button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {MONTH_NAMES[month]} {year}
        </div>
        <button className="cal-nav" onClick={() => shift(1)}>&#8250;</button>
      </div>

      <div className="cal-grid">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="cal-header">{d}</div>
        ))}
        {calDays.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} className="cal-cell empty" />
          const isToday = cell.dateStr === todayStr
          const allDone = cell.dueCount > 0 && cell.doneCount === cell.dueCount
          const partial = cell.doneCount > 0 && cell.doneCount < cell.dueCount
          return (
            <button
              key={cell.dateStr}
              className={`cal-cell ${isToday ? 'today' : ''} ${allDone ? 'all-done' : ''}`}
              onClick={() => onSelectDate(cell.dateStr)}
            >
              <span className="cal-day">{cell.day}</span>
              {cell.dueCount > 0 && (
                <div className="cal-dots">
                  {allDone && <div className="cal-dot" style={{ background: 'var(--green)' }} />}
                  {partial && <div className="cal-dot" style={{ background: 'var(--orange)' }} />}
                  {cell.doneCount === 0 && <div className="cal-dot" style={{ background: 'var(--surface2)' }} />}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', marginRight: 6 }} />
          All taken
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', marginRight: 6, marginLeft: 16 }} />
          Partial
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--surface2)', marginRight: 6, marginLeft: 16 }} />
          Scheduled
        </div>
      </div>

      <style>{`
        .cal-nav {
          font-size: 28px;
          padding: 8px 14px;
          color: var(--text2);
          border-radius: 8px;
        }
        .cal-nav:active { background: var(--surface); }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .cal-header {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text2);
          padding: 8px 0;
        }
        .cal-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          position: relative;
          gap: 2px;
        }
        .cal-cell:active:not(.empty) { background: var(--surface); }
        .cal-cell.today .cal-day {
          background: var(--accent);
          color: var(--bg);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cal-day { font-size: 14px; font-weight: 500; }
        .cal-dots {
          display: flex;
          gap: 3px;
        }
        .cal-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  )
}

export default Calendar
