import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
// 定义运行模式与后端地址
const useSupabase = isSupabaseConfigured()
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

// 创建认证上下文
const AuthContext = createContext({})

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 初始化认证状态
  useEffect(() => {
    // 检查当前会话
    const initializeAuth = async () => {
      try {
        setLoading(true)
        if (useSupabase) {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) throw error
          setSession(session)
          setUser(session?.user ?? null)
        } else {
          const token = localStorage.getItem('access_token')
          if (token) {
            const resp = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (resp.ok) {
              const json = await resp.json()
              setUser(json.user || null)
              setSession({ access_token: token })
            } else {
              setUser(null)
              setSession(null)
              localStorage.removeItem('access_token')
            }
          } else {
            setUser(null)
            setSession(null)
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    if (useSupabase) {
      // 监听认证状态变化（仅Supabase）
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )
      // 清理订阅
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  // 用户登录
  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      if (useSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        return { success: true, data }
      } else {
        const resp = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: '登录失败' }))
          throw new Error(err.error || '登录失败')
        }
        const json = await resp.json()
        const token = json.session?.access_token
        if (token) localStorage.setItem('access_token', token)
        setUser(json.user)
        setSession({ access_token: token })
        return { success: true, data: json }
      }
    } catch (error) {
      console.error('登录失败:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 用户注册
  const register = async (email, password, userData = {}) => {
    try {
      setError(null)
      setLoading(true)
      
      if (useSupabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: userData }
        })
        if (error) throw error
        return { success: true, data }
      } else {
        const resp = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName: userData.fullName })
        })
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: '注册失败' }))
          throw new Error(err.error || '注册失败')
        }
        const json = await resp.json()
        const token = json.session?.access_token
        if (token) localStorage.setItem('access_token', token)
        setUser(json.user)
        setSession({ access_token: token })
        return { success: true, data: json }
      }
    } catch (error) {
      console.error('注册失败:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 用户退出
  const logout = async () => {
    try {
      setError(null)
      setLoading(true)
      
      if (useSupabase) {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      } else {
        // 本地JWT无状态退出
        localStorage.removeItem('access_token')
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).catch(() => {})
      }
      setUser(null)
      setSession(null)
      return { success: true }
    } catch (error) {
      console.error('退出失败:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const resetPassword = async (email) => {
    if (!useSupabase) {
      return { success: false, error: '本地模式未开启重置密码' }
    }
    try {
      setError(null)
      setLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=success`
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('重置密码失败:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 更新密码
  const updatePassword = async (newPassword) => {
    if (!useSupabase) {
      return { success: false, error: '本地模式未开启更新密码' }
    }
    try {
      setError(null)
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('更新密码失败:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 更新用户信息
  const updateUser = async (updates) => {
    if (!useSupabase) {
      return { success: false, error: '本地模式未开启更新用户信息' }
    }
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) throw error

      setUser(data.user)
      return { success: true, data }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 获取用户资料
  const getUserProfile = async () => {
    if (!useSupabase) return null
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      return data
    } catch (error) {
      console.error('获取用户资料失败:', error)
      return null
    }
  }

  // 更新用户资料
  const updateUserProfile = async (profileData) => {
    if (!useSupabase) return { success: false, error: '本地模式未开启资料更新' }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          email: user.email,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('更新用户资料失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 清除错误
  const clearError = () => {
    setError(null)
  }

  // 上下文值
  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateUser,
    getUserProfile,
    updateUserProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// 自定义Hook使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  
  return context
}

export default AuthContext