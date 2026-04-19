import { useState, useEffect, useCallback } from 'react'
import { loadItems, saveItems, loadLogs, saveLogs, formatDate, seedStarterItems, exportData, importData } from './store'
import PinLock, { hasPin, isUnlocked, lockApp } from './views/PinLock'
import Today from './views/Today'
import Calendar from './views/Calendar'
import Items from './views/Items'
import ItemForm from './views/ItemForm'
import Calculator from './views/Calculator'
import './App.css'

const TABS = [
  { id: 'today', label: 'Today', icon: '○' },
  { id: 'calendar', label: 'Calendar', icon: '▦' },
  { id: 'calc', label: 'Calc', icon: '◎' },
  { id: 'items', label: 'Items', icon: '≡' },
]

function App() {
  const [unlocked, setUnlocked] = useState(() => hasPin() && isUnlocked())
  const [tab, setTab] = useState('today')
  const [items, setItems] = useState(() => {
    let existing = loadItems()
    if (existing.length === 0) {
      existing = seedStarterItems() || existing
    }
    return existing
  })
  const [logs, setLogs] = useState(loadLogs)

  const handleExport = useCallback(() => {
    const json = exportData(items, logs)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lisadose-backup-${formatDate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [items, logs])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = importData(ev.target.result)
          setItems(data.items)
          setLogs(data.logs)
        } catch {
          alert('Invalid backup file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [])
  const [editingItem, setEditingItem] = useState(null)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [calcItem, setCalcItem] = useState(null)

  useEffect(() => { saveItems(items) }, [items])
  useEffect(() => { saveLogs(logs) }, [logs])

  const toggleLog = useCallback((itemId, date) => {
    setLogs(prev => {
      const key = `${itemId}:${date}`
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = { time: new Date().toISOString() }
      }
      return next
    })
  }, [])

  const saveItem = useCallback((item) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = item
        return next
      }
      return [...prev, item]
    })
    setEditingItem(null)
  }, [])

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    setLogs(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (key.startsWith(id + ':')) delete next[key]
      }
      return next
    })
    setEditingItem(null)
  }, [])

  // Show PIN lock if not unlocked
  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />
  }

  if (editingItem !== null) {
    return (
      <ItemForm
        item={editingItem}
        onSave={saveItem}
        onDelete={editingItem.id ? deleteItem : null}
        onClose={() => setEditingItem(null)}
      />
    )
  }

  return (
    <div className="app">
      <div className="app-content">
        {tab === 'today' && (
          <Today
            items={items}
            logs={logs}
            date={selectedDate}
            onToggle={toggleLog}
            onDateChange={setSelectedDate}
            onCalc={(item) => { setCalcItem(item); setTab('calc') }}
            onExport={handleExport}
          />
        )}
        {tab === 'calendar' && (
          <Calendar
            items={items}
            logs={logs}
            onSelectDate={(d) => { setSelectedDate(d); setTab('today') }}
          />
        )}
        {tab === 'calc' && (
          <Calculator
            items={items}
            preselect={calcItem}
            onClearPreselect={() => setCalcItem(null)}
          />
        )}
        {tab === 'items' && (
          <Items
            items={items}
            onEdit={setEditingItem}
            onAdd={() => setEditingItem({})}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </div>
      <nav className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
