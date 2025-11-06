import { supabase, isSupabaseConfigured } from './supabase'
import { localStorageAPI } from './storage'

// 统一的API接口，根据配置选择使用Supabase或本地存储
const useSupabase = isSupabaseConfigured()
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export const api = {
  // 获取指定日期的计划（支持用户隔离）
  async getPlans(date, userId = null) {
    if (useSupabase && userId) {
      try {
        // 登录用户使用Supabase，自动应用RLS（行级安全策略）
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('plan_date', date)
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase获取计划失败:', error)
        return []
      }
    } else if (useSupabase) {
      // 匿名用户使用公共计划表
      try {
        const sessionId = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
        localStorage.setItem('anonymous_session_id', sessionId)
        
        const { data, error } = await supabase
          .from('public_plans')
          .select('*')
          .eq('plan_date', date)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase获取公共计划失败，使用本地接口:', error)
        // 回退到本地SQLite服务端
        const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
        localStorage.setItem('anonymous_session_id', sid)
        const resp = await fetch(`${API_BASE}/plans?date=${encodeURIComponent(date)}&sessionId=${encodeURIComponent(sid)}`)
        const json = await resp.json()
        return Array.isArray(json) ? json : []
      }
    } else {
      // 未配置Supabase时使用本地SQLite服务端
      const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
      localStorage.setItem('anonymous_session_id', sid)
      const qs = userId ? `userId=${encodeURIComponent(userId)}` : `sessionId=${encodeURIComponent(sid)}`
      const resp = await fetch(`${API_BASE}/plans?date=${encodeURIComponent(date)}&${qs}`)
      const json = await resp.json()
      return Array.isArray(json) ? json : []
    }
  },

  // 添加新计划（支持用户隔离）
  async addPlan(content, date, userId = null) {
    if (useSupabase && userId) {
      try {
        const { data, error } = await supabase
          .from('plans')
          .insert([{ 
            content, 
            plan_date: date, 
            completed: false,
            user_id: userId // 关联用户ID
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase添加计划失败:', error)
        throw error
      }
    } else if (useSupabase) {
      // 匿名用户使用公共计划表
      try {
        const sessionId = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
        localStorage.setItem('anonymous_session_id', sessionId)
        
        const { data, error } = await supabase
          .from('public_plans')
          .insert([{ 
            content, 
            plan_date: date, 
            completed: false,
            session_id: sessionId
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase添加公共计划失败，使用本地接口:', error)
        const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
        localStorage.setItem('anonymous_session_id', sid)
        const resp = await fetch(`${API_BASE}/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, date, sessionId: sid })
        })
        const json = await resp.json()
        return json
      }
    } else {
      const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
      localStorage.setItem('anonymous_session_id', sid)
      const resp = await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, date, userId, sessionId: sid })
      })
      const json = await resp.json()
      return json
    }
  },

  // 更新计划（支持用户隔离）
  async updatePlan(id, updates, userId = null) {
    if (useSupabase && userId) {
      try {
        const { data, error } = await supabase
          .from('plans')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId) // 确保只能更新自己的计划
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase更新计划失败:', error)
        throw error
      }
    } else if (useSupabase) {
      // 匿名用户更新公共计划
      try {
        const sessionId = localStorage.getItem('anonymous_session_id')
        if (!sessionId) throw new Error('匿名会话不存在')
        
        const { data, error } = await supabase
          .from('public_plans')
          .update(updates)
          .eq('id', id)
          .eq('session_id', sessionId)
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase更新公共计划失败，使用本地接口:', error)
        const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
        localStorage.setItem('anonymous_session_id', sid)
        const resp = await fetch(`${API_BASE}/plans/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates, sessionId: sid })
        })
        const json = await resp.json()
        return json
      }
    } else {
      const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
      localStorage.setItem('anonymous_session_id', sid)
      const resp = await fetch(`${API_BASE}/plans/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, userId, sessionId: sid })
      })
      const json = await resp.json()
      return json
    }
  },

  // 删除计划（支持用户隔离）
  async deletePlan(id, userId = null) {
    if (useSupabase && userId) {
      try {
        const { error } = await supabase
          .from('plans')
          .delete()
          .eq('id', id)
          .eq('user_id', userId) // 确保只能删除自己的计划
        
        if (error) throw error
        return { success: true }
      } catch (error) {
        console.error('Supabase删除计划失败:', error)
        throw error
      }
    } else if (useSupabase) {
      // 匿名用户删除公共计划
      try {
        const sessionId = localStorage.getItem('anonymous_session_id')
        if (!sessionId) throw new Error('匿名会话不存在')
        
        const { error } = await supabase
          .from('public_plans')
          .delete()
          .eq('id', id)
          .eq('session_id', sessionId)
        
        if (error) throw error
        return { success: true }
      } catch (error) {
        console.error('Supabase删除公共计划失败，使用本地接口:', error)
        const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
        localStorage.setItem('anonymous_session_id', sid)
        const resp = await fetch(`${API_BASE}/plans/${encodeURIComponent(id)}?sessionId=${encodeURIComponent(sid)}`, { method: 'DELETE' })
        const json = await resp.json()
        return json
      }
    } else {
      const sid = localStorage.getItem('anonymous_session_id') || this.generateSessionId()
      localStorage.setItem('anonymous_session_id', sid)
      const qs = userId ? `userId=${encodeURIComponent(userId)}` : `sessionId=${encodeURIComponent(sid)}`
      const resp = await fetch(`${API_BASE}/plans/${encodeURIComponent(id)}?${qs}`, { method: 'DELETE' })
      const json = await resp.json()
      return json
    }
  },

  // 数据迁移：匿名用户数据迁移到注册用户
  async migrateAnonymousDataToUser(userId) {
    if (!useSupabase) return { success: true }
    
    try {
      const sessionId = localStorage.getItem('anonymous_session_id')
      if (!sessionId) return { success: true } // 没有匿名数据需要迁移
      
      // 1. 获取匿名用户的所有计划
      const { data: anonymousPlans, error: fetchError } = await supabase
        .from('public_plans')
        .select('*')
        .eq('session_id', sessionId)
      
      if (fetchError) throw fetchError
      if (!anonymousPlans || anonymousPlans.length === 0) return { success: true }
      
      // 2. 将匿名计划迁移到用户账户
      const migratedPlans = anonymousPlans.map(plan => ({
        content: plan.content,
        plan_date: plan.plan_date,
        completed: plan.completed,
        user_id: userId,
        created_at: plan.created_at,
        updated_at: plan.updated_at
      }))
      
      const { error: insertError } = await supabase
        .from('plans')
        .insert(migratedPlans)
      
      if (insertError) throw insertError
      
      // 3. 删除匿名计划
      const { error: deleteError } = await supabase
        .from('public_plans')
        .delete()
        .eq('session_id', sessionId)
      
      if (deleteError) throw deleteError
      
      // 4. 清空本地存储的匿名数据
      localStorage.removeItem('anonymous_session_id')
      
      console.log(`成功迁移了 ${anonymousPlans.length} 条匿名计划到用户账户`)
      return { success: true, migratedCount: anonymousPlans.length }
    } catch (error) {
      console.error('数据迁移失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 生成匿名会话ID
  generateSessionId() {
    return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  // 获取用户统计信息
  async getUserStats(userId) {
    if (!useSupabase || !userId) return null
    
    try {
      // 获取总计划数
      const { count: totalPlans } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      // 获取已完成计划数
      const { count: completedPlans } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
      
      // 获取本月计划数
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
      
      const { count: monthPlans } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('plan_date', startDate)
      
      return {
        totalPlans: totalPlans || 0,
        completedPlans: completedPlans || 0,
        monthPlans: monthPlans || 0,
        completionRate: totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
      return null
    }
  }
}