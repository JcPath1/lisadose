const ITEMS_KEY = 'lisadose_items'
const LOGS_KEY = 'lisadose_logs'
const SEEDED_KEY = 'lisadose_seeded'

export function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(ITEMS_KEY)) || []
  } catch { return [] }
}

export function saveItems(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY)) || {}
  } catch { return {} }
}

export function saveLogs(logs) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

// Log key format: "itemId:YYYY-MM-DD"
export function getLogKey(itemId, date) {
  return `${itemId}:${date}`
}

export function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const CATEGORIES = [
  { value: 'peptide', label: 'Peptide', color: 'var(--accent)' },
  { value: 'testosterone', label: 'Testosterone', color: 'var(--orange)' },
  { value: 'supplement', label: 'Supplement', color: 'var(--green)' },
  { value: 'vitamin', label: 'Vitamin', color: 'var(--purple)' },
  { value: 'other', label: 'Other', color: 'var(--text2)' },
]

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'interval', label: 'Every N Days' },
  { value: 'custom', label: 'Custom Days' },
]

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function isDueOnDate(item, dateStr, logs) {
  const hasLog = !!(logs && logs[`${item.id}:${dateStr}`])
  if (item.paused) return hasLog
  const d = parseDate(dateStr)

  if (item.pauseAfter) {
    const pauseDay = parseDate(item.pauseAfter)
    if (d > pauseDay) return hasLog
  }

  if (item.startDate) {
    const start = parseDate(item.startDate)
    if (d < start) return hasLog
  }

  if (hasLog) return true

  const day = d.getDay()

  if (item.frequency === 'daily') return true
  if (item.frequency === 'weekly') return (item.days || []).includes(day)
  if (item.frequency === 'biweekly') {
    if (!(item.days || []).includes(day)) return false
    const start = parseDate(item.startDate || dateStr)
    const diffWeeks = Math.floor((d - start) / (7 * 86400000))
    return diffWeeks % 2 === 0
  }
  if (item.frequency === 'interval') {
    const n = parseInt(item.intervalDays)
    if (!n || n < 1) return false
    const start = parseDate(item.startDate || dateStr)
    const diffDays = Math.round((d - start) / 86400000)
    return diffDays >= 0 && diffDays % n === 0
  }
  if (item.frequency === 'custom') return (item.days || []).includes(day)
  return false
}

export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Dosing calculator
export function calcSyringe(doseValue, doseUnit, vialStrengthMg, bacWaterMl) {
  if (!doseValue || !vialStrengthMg || !bacWaterMl) return null
  const dose = parseFloat(doseValue)
  const vial = parseFloat(vialStrengthMg)
  const water = parseFloat(bacWaterMl)
  if (!dose || !vial || !water) return null

  let doseMg = dose
  if (doseUnit === 'mcg') doseMg = dose / 1000
  if (doseUnit === 'IU') return null

  const concentration = vial / water
  const mlToDraw = doseMg / concentration
  const syringeUnits = mlToDraw * 100
  const dosesPerVial = vial / doseMg

  return {
    syringeUnits: Math.round(syringeUnits * 10) / 10,
    mlToDraw: Math.round(mlToDraw * 1000) / 1000,
    concentration: Math.round(concentration * 100) / 100,
    dosesPerVial: Math.floor(dosesPerVial),
  }
}

// Lisa's peptide protocol - per Lisa_Peptide_Protocol_for_CC_v1.2 (2026-04-19)
// Day encoding: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
export const STARTER_ITEMS = [
  {
    name: 'GHK-Cu',
    category: 'peptide',
    description: 'Copper peptide. Collagen synthesis, connective tissue & skin support, anti-inflammatory. Daily backbone of the repair stack.',
    dose: '1',
    unit: 'mg',
    frequency: 'daily',
    days: [],
    time: '08:00',
    vialStrength: '50',
    bacWater: '3',
    notes: 'SubQ morning daily. 1mg = 6 units (50mg/3mL). Combine with BPC-157 in same syringe on overlap days (Mon/Wed/Thu/Sun): draw BPC-157 FIRST (8u), then GHK-Cu (6u) = 14u total. Inject within 5-10 min of mixing. Slight blue tint is normal.',
    stackGroup: 'am-repair',
  },
  {
    name: 'BPC-157',
    category: 'peptide',
    description: "Body Protection Compound. Tendon/ligament/gut repair, anti-inflammatory, joint swelling reduction. Systemic dose for Lisa's psoriatic arthritis support.",
    dose: '250',
    unit: 'mcg',
    frequency: 'weekly',
    days: [0, 1, 3, 4],
    time: '08:00',
    vialStrength: '10',
    bacWater: '3',
    notes: 'SubQ morning Mon/Wed/Thu/Sun. 250mcg = 8 units (10mg/3mL, rounded from 7.5 to ensure full systemic dose). Combine with GHK-Cu in same syringe: draw BPC-157 FIRST (8u), then GHK-Cu (6u) = 14u total.',
    stackGroup: 'am-repair',
  },
  {
    name: 'TB-500',
    category: 'peptide',
    description: 'Thymosin Beta-4. Systemic tissue repair, immune modulation, regeneration. Pairs with BPC-157 for triple repair stack.',
    dose: '1',
    unit: 'mg',
    frequency: 'weekly',
    days: [3, 6],
    time: '08:00',
    vialStrength: '10',
    bacWater: '3',
    notes: 'SubQ morning Wed/Sat. 1mg = 30 units (10mg/3mL). Split from original 2.5mg single dose; smaller volume, better tolerated. Solo injection (do not combine).',
  },
  {
    name: 'NAD+',
    category: 'peptide',
    description: 'Buffered NAD+. Direct NAD+ replenishment for mitochondrial support, cellular energy, and cognitive function during the Adderall taper.',
    dose: '50',
    unit: 'mg',
    frequency: 'weekly',
    days: [1, 4],
    time: '08:00',
    vialStrength: '500',
    bacWater: '3',
    notes: 'Morning ONLY (never at night - causes insomnia). 50mg = 30 units (500mg/3mL). FIRST 2 DOSES: start at 25 units to assess flushing tolerance, then escalate to 30u. Inject slowly over 30-60 seconds. 500mg vial lasts ~5 weeks.',
  },
  {
    name: '5-Amino-1MQ',
    category: 'peptide',
    description: 'NNMT inhibitor. Boosts cellular metabolism, supports muscle preservation on Retatrutide, improves NAD+ efficiency.',
    dose: '50',
    unit: 'mg',
    frequency: 'weekly',
    days: [1, 5],
    time: '08:00',
    vialStrength: '50',
    bacWater: '3',
    notes: 'SubQ morning Mon/Fri. 50mg = 30 units (50mg/3mL sterile water - NOT BAC). Amber vial - keep from light. Mild stinging is normal. Well-tolerated; supports muscle preservation while on Retatrutide.',
  },
  {
    name: 'KPV',
    category: 'peptide',
    description: 'Alpha-MSH fragment. Potent anti-inflammatory specifically targeting psoriatic arthritis joint swelling. Different mechanism from Humira - complements rather than conflicts.',
    dose: '500',
    unit: 'mcg',
    frequency: 'weekly',
    days: [1, 2, 3, 4, 5],
    time: '08:00',
    vialStrength: '30',
    bacWater: '3',
    notes: 'SubQ morning Mon-Fri (weekends off). 500mcg = 5 units (30mg/3mL). Targets PsA joint swelling & finger inflammation. Swelling reduction typically noticeable at 4-8 weeks, full effect 12-16 weeks. ~12-week vial life.',
  },
  {
    name: 'Retatrutide',
    category: 'peptide',
    description: 'Triple GLP-1/GIP/Glucagon agonist. Weight loss, reduces visceral fat & inflammatory burden. Slow titration alongside Adderall taper - never change both in the same week.',
    dose: '1',
    unit: 'mg',
    frequency: 'weekly',
    days: [0],
    time: '08:00',
    vialStrength: '10',
    bacWater: '3',
    notes: 'SubQ Sunday morning, rotate site weekly. STARTING DOSE: 1mg = 30 units (10mg/3mL sterile water). Wk 1-4: 1mg (30u). Wk 5-8: 2mg (60u). Wk 9-14: 4mg (120u - exceeds 1mL syringe, split 60+60). ONE VARIABLE RULE: never change Retatrutide dose AND Adderall in the same week. Hold dose if GI side effects significant. Protein 100g+/day mandatory.',
  },
]

export function seedStarterItems() {
  if (localStorage.getItem(SEEDED_KEY)) return null
  const today = formatDate(new Date())
  const items = STARTER_ITEMS.map(item => ({
    ...item,
    id: createId(),
    startDate: today,
  }))
  localStorage.setItem(SEEDED_KEY, 'true')
  return items
}

// --- Export / Import for backup ---

export function exportData(items, logs) {
  return JSON.stringify({ items, logs, exportedAt: new Date().toISOString() }, null, 2)
}

export function importData(jsonString) {
  const data = JSON.parse(jsonString)
  if (!data.items || !data.logs) throw new Error('Invalid backup file')
  return { items: data.items, logs: data.logs }
}
