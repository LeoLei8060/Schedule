import express from 'express'
import {
  initDB,
  newId,
  getPlansByDateAndUser,
  getPublicPlansByDateAndSession,
  insertUserPlan,
  insertPublicPlan,
  updateUserPlan,
  updatePublicPlan,
  deleteUserPlan,
  deletePublicPlan
} from '../lib/db.js'

const router = express.Router()

// 确保DB初始化
initDB()

// 获取指定日期的计划（支持用户和匿名）
router.get('/', (req, res) => {
  const { date, userId, sessionId } = req.query
  if (!date) return res.status(400).json({ error: '缺少 date 参数' })

  if (userId) {
    const rows = getPlansByDateAndUser(date, userId)
    return res.json(rows)
  }
  const rows = getPublicPlansByDateAndSession(date, sessionId || null)
  return res.json(rows)
})

// 添加计划（改为支持 exercise_type/unit/quantity）
router.post('/', (req, res) => {
  const { content, exercise_type, unit, quantity = 0, date, userId, sessionId } = req.body
  if ((!content && !exercise_type) || !date) return res.status(400).json({ error: '缺少 content/exercise_type 或 date' })

  const now = new Date().toISOString()
  const id = newId()
  if (userId) {
    const r = insertUserPlan({ id, content, exercise_type, unit, quantity, date, userId, now })
    return res.json(r)
  }
  const r = insertPublicPlan({ id, content, exercise_type, unit, quantity, date, sessionId: sessionId || null, now })
  return res.json(r)
})

// 更新计划（支持 exercise_type/unit/quantity/completed）
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { updates, userId, sessionId } = req.body

  if (userId) {
    const r = updateUserPlan(id, userId, updates || {})
    if (!r) return res.status(404).json({ error: '计划不存在' })
    return res.json(r)
  }
  const r = updatePublicPlan(id, sessionId || null, updates || {})
  if (!r) return res.status(404).json({ error: '计划不存在' })
  return res.json(r)
})

// 删除计划（支持用户和匿名）
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const { userId, sessionId } = req.query

  if (userId) {
    const ok = deleteUserPlan(id, userId)
    return res.json({ success: !!ok })
  }
  const ok = deletePublicPlan(id, sessionId || null)
  return res.json({ success: !!ok })
})

export default router