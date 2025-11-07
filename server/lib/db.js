import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let db = null
const dataDir = path.join(__dirname, '..', 'data')
const dbFile = path.join(dataDir, 'db.json')

function save() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8')
}

export function initDB() {
  if (db) return db
  if (!fs.existsSync(dbFile)) {
    db = { users: [], profiles: [], plans: [], public_plans: [] }
    save()
  } else {
    db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'))
    db.plans = db.plans || []
    db.public_plans = db.public_plans || []
  }
  return db
}

export function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getPlansByDateAndUser(date, userId) {
  if (!db) initDB()
  return db.plans
    .filter(p => p.plan_date === date && p.user_id === userId)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
    .map(p => ({ ...p, completed: !!p.completed }))
}

export function getPublicPlansByDateAndSession(date, sessionId) {
  if (!db) initDB()
  return db.public_plans
    .filter(p => p.plan_date === date && p.session_id === sessionId)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
    .map(p => ({ ...p, completed: !!p.completed }))
}

export function insertUserPlan({ id, content, exercise_type, unit, quantity = 0, date, userId, now }) {
  if (!db) initDB()
  const rec = {
    id,
    content: content ?? (exercise_type ?? ''),
    exercise_type: exercise_type ?? null,
    unit: unit ?? null,
    quantity: Number(quantity) || 0,
    plan_date: date,
    completed: 0,
    user_id: userId,
    created_at: now,
    updated_at: now
  }
  db.plans.push(rec)
  save()
  return { ...rec, completed: !!rec.completed }
}

export function insertPublicPlan({ id, content, exercise_type, unit, quantity = 0, date, sessionId, now }) {
  if (!db) initDB()
  const rec = {
    id,
    content: content ?? (exercise_type ?? ''),
    exercise_type: exercise_type ?? null,
    unit: unit ?? null,
    quantity: Number(quantity) || 0,
    plan_date: date,
    completed: 0,
    session_id: sessionId || null,
    created_at: now,
    updated_at: now
  }
  db.public_plans.push(rec)
  save()
  return { ...rec, completed: !!rec.completed }
}

export function updateUserPlan(id, userId, updates) {
  if (!db) initDB()
  const rec = db.plans.find(p => p.id === id && p.user_id === userId)
  if (!rec) return null
  rec.content = updates.content ?? rec.content
  if (updates.exercise_type !== undefined) rec.exercise_type = updates.exercise_type
  if (updates.unit !== undefined) rec.unit = updates.unit
  if (updates.quantity !== undefined) rec.quantity = Number(updates.quantity) || 0
  if (updates.completed != null) rec.completed = updates.completed ? 1 : 0
  rec.updated_at = new Date().toISOString()
  save()
  return { ...rec, completed: !!rec.completed }
}

export function updatePublicPlan(id, sessionId, updates) {
  if (!db) initDB()
  const rec = db.public_plans.find(p => p.id === id && p.session_id === sessionId)
  if (!rec) return null
  rec.content = updates.content ?? rec.content
  if (updates.exercise_type !== undefined) rec.exercise_type = updates.exercise_type
  if (updates.unit !== undefined) rec.unit = updates.unit
  if (updates.quantity !== undefined) rec.quantity = Number(updates.quantity) || 0
  if (updates.completed != null) rec.completed = updates.completed ? 1 : 0
  rec.updated_at = new Date().toISOString()
  save()
  return { ...rec, completed: !!rec.completed }
}

export function findUserByEmail(email) {
  if (!db) initDB()
  return db.users.find(u => u.email === email) || null
}

export function getUserById(id) {
  if (!db) initDB()
  return db.users.find(u => u.id === id) || null
}

export function getUserWithProfileByEmail(email) {
  const u = findUserByEmail(email)
  if (!u) return null
  const p = (db && db.profiles ? db.profiles.find(p => p.id === u.id) : null) || {}
  return { id: u.id, email: u.email, full_name: p.full_name || null, avatar_url: p.avatar_url || null }
}

export function getUserWithProfileById(id) {
  const u = getUserById(id)
  if (!u) return null
  const p = (db && db.profiles ? db.profiles.find(p => p.id === id) : null) || {}
  return { id: u.id, email: u.email, full_name: p.full_name || null, avatar_url: p.avatar_url || null }
}

export function createUser(user) {
  if (!db) initDB()
  db.users.push(user)
  save()
}

export function createProfile(profile) {
  if (!db) initDB()
  const exist = db.profiles.find(p => p.id === profile.id)
  if (!exist) db.profiles.push(profile)
  else Object.assign(exist, profile)
  save()
}

export function deleteUserPlan(id, userId) {
  if (!db) initDB()
  const idx = db.plans.findIndex(p => p.id === id && p.user_id === userId)
  if (idx === -1) return false
  db.plans.splice(idx, 1)
  save()
  return true
}

export function deletePublicPlan(id, sessionId) {
  if (!db) initDB()
  const idx = db.public_plans.findIndex(p => p.id === id && p.session_id === sessionId)
  if (idx === -1) return false
  db.public_plans.splice(idx, 1)
  save()
  return true
}