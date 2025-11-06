import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import planRoutes from './routes/plans.js'
import { initDB } from './lib/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: [/^http:\/\/localhost:\d+$/], credentials: true }))
app.use(express.json())

// 初始化数据库（JSON存储）
initDB()

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/plans', planRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 数据库备份：创建备份文件（db.json -> db-backup-<timestamp>.json）
app.post('/api/db/backup', (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data')
    const src = path.join(dataDir, 'db.json')
    if (!fs.existsSync(src)) return res.status(404).json({ error: '数据库文件不存在' })
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const dest = path.join(dataDir, `db-backup-${ts}.json`)
    fs.copyFileSync(src, dest)
    res.json({ success: true, path: dest })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 数据库备份：列出备份文件
app.get('/api/db/backups', (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data')
    if (!fs.existsSync(dataDir)) return res.json([])
    const files = fs.readdirSync(dataDir)
      .filter(f => /^db-backup-.*\.json$/.test(f))
      .map(f => ({ name: f, path: path.join(dataDir, f) }))
    res.json(files)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(PORT, () => {
  console.log(`JSON 存储服务已启动: http://localhost:${PORT}`)
})