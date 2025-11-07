// 统一前端 API：使用本地后端，支持新字段 exercise_type/unit/quantity
const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:4000/api'

// 获取指定日期的计划
export async function getPlans(dateStr) {
  const date = dateStr || new Date().toISOString().slice(0, 10)
  const res = await fetch(`${API_BASE}/plans?date=${encodeURIComponent(date)}`)
  if (!res.ok) throw new Error('获取计划失败')
  return await res.json()
}

// 添加计划：exercise_type/unit/quantity + date
export async function addPlan(exerciseType, unit, quantity, dateStr) {
  const payload = {
    exercise_type: exerciseType,
    unit,
    quantity: Number(quantity) || 0,
    date: dateStr || new Date().toISOString().slice(0, 10)
  }
  const res = await fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('添加计划失败')
  return await res.json()
}

// 更新计划：支持修改 exercise_type、unit、quantity、completed
export async function updatePlan(id, updates) {
  const normalized = {}
  if (updates.exerciseType !== undefined) normalized.exercise_type = updates.exerciseType
  if (updates.unit !== undefined) normalized.unit = updates.unit
  if (updates.quantity !== undefined) normalized.quantity = Number(updates.quantity) || 0
  if (updates.completed !== undefined) normalized.completed = !!updates.completed

  const res = await fetch(`${API_BASE}/plans/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates: normalized })
  })
  if (!res.ok) throw new Error('更新计划失败')
  return await res.json()
}

// 删除计划
export async function deletePlan(id) {
  const res = await fetch(`${API_BASE}/plans/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('删除计划失败')
  return { success: true }
}