import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  initDB,
  newId,
  findUserByEmail,
  createUser,
  createProfile,
  getUserWithProfileById,
  getUserWithProfileByEmail
} from '../lib/db.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function toUserResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    user_metadata: {
      fullName: row.full_name || null,
      avatar_url: row.avatar_url || null
    }
  }
}

// 确保DB初始化
initDB()

router.post('/register', (req, res) => {
  const { email, password, fullName } = req.body
  if (!email || !password) return res.status(400).json({ error: '缺少 email 或 password' })

  const exists = findUserByEmail(email)
  if (exists) return res.status(409).json({ error: '邮箱已注册' })

  const id = newId()
  const now = new Date().toISOString()
  const password_hash = bcrypt.hashSync(password, 10)

  createUser({ id, email, password_hash, created_at: now, updated_at: now })
  createProfile({ id, full_name: fullName || null, created_at: now, updated_at: now })

  const token = jwt.sign({ uid: id }, JWT_SECRET, { expiresIn: '7d' })
  const userRow = getUserWithProfileById(id)
  res.json({ user: toUserResponse(userRow), session: { access_token: token } })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: '缺少 email 或 password' })

  const u = findUserByEmail(email)
  if (!u) return res.status(401).json({ error: '用户不存在或密码错误' })
  const ok = bcrypt.compareSync(password, u.password_hash)
  if (!ok) return res.status(401).json({ error: '用户不存在或密码错误' })

  const token = jwt.sign({ uid: u.id }, JWT_SECRET, { expiresIn: '7d' })
  const profile = getUserWithProfileById(u.id)
  res.json({ user: toUserResponse(profile), session: { access_token: token } })
})

router.post('/logout', (req, res) => {
  // 本地 JWT 无状态退出，前端删除令牌即可
  res.json({ success: true })
})

router.get('/me', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: '未登录' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const row = getUserWithProfileById(payload.uid)
    if (!row) return res.status(401).json({ error: '令牌无效' })
    res.json({ user: toUserResponse(row) })
  } catch (e) {
    res.status(401).json({ error: '令牌无效' })
  }
})

export default router