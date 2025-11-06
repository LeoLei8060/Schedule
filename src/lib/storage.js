// 本地存储工具，用于Supabase未配置时的后备方案
const STORAGE_KEY = 'monthly_plans'

export const localStorageAPI = {
  // 获取指定日期的计划
  async getPlans(date) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const allPlans = stored ? JSON.parse(stored) : []
      return allPlans.filter(plan => plan.plan_date === date)
    } catch (error) {
      console.error('获取计划失败:', error)
      return []
    }
  },

  // 添加新计划
  async addPlan(content, date) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const allPlans = stored ? JSON.parse(stored) : []
      
      const newPlan = {
        id: Date.now().toString(),
        content,
        plan_date: date,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      allPlans.push(newPlan)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlans))
      return newPlan
    } catch (error) {
      console.error('添加计划失败:', error)
      throw error
    }
  },

  // 更新计划
  async updatePlan(id, updates) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const allPlans = stored ? JSON.parse(stored) : []
      
      const index = allPlans.findIndex(plan => plan.id === id)
      if (index === -1) throw new Error('计划不存在')
      
      allPlans[index] = {
        ...allPlans[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlans))
      return allPlans[index]
    } catch (error) {
      console.error('更新计划失败:', error)
      throw error
    }
  },

  // 删除计划
  async deletePlan(id) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const allPlans = stored ? JSON.parse(stored) : []
      
      const filteredPlans = allPlans.filter(plan => plan.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPlans))
      
      return { success: true }
    } catch (error) {
      console.error('删除计划失败:', error)
      throw error
    }
  }
}