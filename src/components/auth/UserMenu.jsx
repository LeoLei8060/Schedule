import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, Settings, LogOut, ChevronDown, UserCircle } from 'lucide-react'

const UserMenu = ({ onLogin, onRegister }) => {
  const { user, logout, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 处理退出登录
  const handleLogout = async () => {
    if (loading) return
    
    const result = await logout()
    if (result.success) {
      setIsOpen(false)
      // 可以添加退出成功的提示
    }
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    if (!user) return '用户'
    
    // 优先使用用户资料中的姓名
    if (user.user_metadata?.fullName) {
      return user.user_metadata.fullName
    }
    
    // 使用邮箱前缀
    if (user.email) {
      return user.email.split('@')[0]
    }
    
    return '用户'
  }

  // 获取用户头像
  const getAvatar = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    return null
  }

  // 未登录：显示登录/注册按钮
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={onLogin}
          className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          登录
        </button>
        <button
          onClick={onRegister}
          className="px-3 py-2 bg-white text-blue-600 text-sm font-medium rounded-md border border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          注册
        </button>
      </div>
    )
  }

  // 已登录：显示用户菜单
  return (
    <div className="relative" ref={dropdownRef}>
      {/* 用户菜单触发器 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        disabled={loading}
      >
        {/* 用户头像或图标 */}
        <div className="flex-shrink-0">
          {getAvatar() ? (
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={getAvatar()}
              alt={getDisplayName()}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        
        {/* 用户名称 */}
        <span className="hidden md:block font-medium">
          {getDisplayName()}
        </span>
        
        {/* 下拉箭头 */}
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          {/* 用户信息头部 */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getAvatar() ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={getAvatar()}
                    alt={getDisplayName()}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* 菜单选项 */}
          <div className="py-1">
            {/* 个人资料 */}
            <button
              onClick={() => {
                setIsOpen(false)
                alert('个人资料功能即将推出')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100"
            >
              <User className="mr-3 h-4 w-4" />
              个人资料
            </button>

            {/* 设置 */}
            <button
              onClick={() => {
                setIsOpen(false)
                alert('设置功能即将推出')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100"
            >
              <Settings className="mr-3 h-4 w-4" />
              设置
            </button>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-gray-200"></div>

          {/* 退出登录 */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="mr-3 h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  退出中...
                </>
              ) : (
                <>
                  <LogOut className="mr-3 h-4 w-4" />
                  退出登录
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu