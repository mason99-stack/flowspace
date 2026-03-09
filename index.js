import express from 'express'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// Data file location
const DATA_DIR = join(process.env.HOME || '~', '.flowspace')
const DATA_FILE = join(DATA_DIR, 'data.json')

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

app.use(express.json({ limit: '10mb' }))

// ── API: load data ────────────────────────────
app.get('/api/data', (req, res) => {
  try {
    if (!existsSync(DATA_FILE)) {
      return res.json({ data: null })
    }
    const raw = readFileSync(DATA_FILE, 'utf8')
    res.json({ data: JSON.parse(raw) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── API: save data ────────────────────────────
app.post('/api/data', (req, res) => {
  try {
    const { data } = req.body
    if (!data) return res.status(400).json({ error: 'No data provided' })
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── API: export backup ────────────────────────
app.get('/api/export', (req, res) => {
  try {
    if (!existsSync(DATA_FILE)) return res.status(404).json({ error: 'No data' })
    const raw = readFileSync(DATA_FILE, 'utf8')
    const date = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="flowspace-backup-${date}.json"`)
    res.send(raw)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Serve React app ───────────────────────────
const DIST = join(__dirname, '..', 'dist')
app.use(express.static(DIST))
app.get('*', (req, res) => {
  res.sendFile(join(DIST, 'index.html'))
})

// ── Start ─────────────────────────────────────
const server = createServer(app)
server.listen(PORT, '127.0.0.1', () => {
  console.log('')
  console.log('  ✦ FlowSpace')
  console.log(`  Corriendo en http://localhost:${PORT}`)
  console.log(`  Datos en: ${DATA_FILE}`)
  console.log('')
  console.log('  Ctrl+C para parar')
  console.log('')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n  ✦ FlowSpace detenido. ¡Hasta luego!')
  process.exit(0)
})
