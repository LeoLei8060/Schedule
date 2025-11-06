import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'

function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const navigate = useNavigate()
  const { user } = useAuth()

  // 如果用户已登录，重定向到首页
  React.useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleModeChange = (newMode) => {
    setMode(newMode)
  }

  const handleSuccess = () => {
    // 登录/注册成功后重定向到首页
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo 和标题 */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? '登录您的账户' : '创建新账户'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' ? (
              <>
                还没有账户？
                <button
                  onClick={() => handleModeChange('register')}
                  className="font-medium text-blue-600 hover:text-blue-500 ml-1"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账户？
                <button
                  onClick={() => handleModeChange('login')}
                  className="font-medium text-blue-600 hover:text-blue-500 ml-1"
                >
                  立即登录
                </button>
              </>
            )}
          </p>
        </div>

        {/* 表单区域 */}
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          {mode === 'login' ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>

        {/* 返回首页链接 */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            返回首页
          </Link>
        </div>

        {/* 匿名使用提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">匿名使用</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  您也可以选择匿名使用本应用，您的数据将保存在当前浏览器中。
                  登录后可随时将匿名数据迁移到您的账户。
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    to="/"
                    className="bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-500"
                  >
                    匿名使用
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage