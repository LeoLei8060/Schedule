import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">验证登录状态中...</p>
        </div>
      </div>
    )
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    // 保存当前路径，登录后可以跳转回来
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // 用户已登录，渲染子组件
  return children
}

export default ProtectedRoute