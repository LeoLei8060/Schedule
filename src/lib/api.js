import { supabase, isSupabaseConfigured } from './supabase'
import { localStorageAPI } from './storage'

// 统一的API接口，根据配置选择使用Supabase或本地存储
const useSupabase = isSupabaseConfigured()

export const api = {
  // 获取指定日期的计划
  async getPlans(date) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('plan_date', date)
          .order('created_at', { ascending: true })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase获取计划失败，使用本地存储:', error)
        return localStorageAPI.getPlans(date)
      }
    } else {
      return localStorageAPI.getPlans(date)
    }
  },

  // 添加新计划
  async addPlan(content, date) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('plans')
          .insert([{ content, plan_date: date, completed: false }])
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase添加计划失败，使用本地存储:', error)
        return localStorageAPI.addPlan(content, date)
      }
    } else {
      return localStorageAPI.addPlan(content, date)
    }
  },

  // 更新计划
  async updatePlan(id, updates) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('plans')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase更新计划失败，使用本地存储:', error)
        return localStorageAPI.updatePlan(id, updates)
      }
    } else {
      return localStorageAPI.updatePlan(id, updates)
    }
  },

  // 删除计划
  async deletePlan(id) {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('plans')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        return { success: true }
      } catch (error) {
        console.error('Supabase删除计划失败，使用本地存储:', error)
        return localStorageAPI.deletePlan(id)
      }
    } else {
      return localStorageAPI.deletePlan(id)
    }
  }
}