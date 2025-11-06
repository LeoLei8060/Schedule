import React, { useState } from 'react'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode) // 'login' or 'register'

  if (!isOpen) return null

  const handleSuccess = () => {
    // 登录或注册成功后的处理
    onClose()
  }

  const switchToLogin = () => {
    setMode('login')
  }

  const switchToRegister = () => {
    setMode('register')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />
        
        {/* 居中对齐 */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* 弹窗内容 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* 关闭按钮 */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 模式切换标签 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={switchToLogin}
              className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              登录
            </button>
            <button
              onClick={switchToRegister}
              className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              注册
            </button>
          </div>

          {/* 表单内容 */}
          <div className="px-6 py-6">
            {mode === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToRegister={switchToRegister}
                onClose={onClose}
              />
            ) : (
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={switchToLogin}
                onClose={onClose}
              />
            )}
          </div>

          {/* 底部信息 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {mode === 'login' 
                ? '登录即表示您同意我们的服务条款和隐私政策'
                : '注册即表示您同意我们的服务条款和隐私政策'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal