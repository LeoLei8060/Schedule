import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Calendar from './components/Calendar'
import PlanList from './components/PlanList'
import MonthNavigation from './components/MonthNavigation'
import { api } from './lib/api'

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [plans, setPlans] = useState([])
  const [monthPlans, setMonthPlans] = useState([])
  const [loading, setLoading] = useState(true)

  // 获取计划数据
  const fetchPlans = async (date) => {
    try {
      setLoading(true)
      const dateStr = format(date, 'yyyy-MM-dd')
      const data = await api.getPlans(dateStr)
      setPlans(data)
    } catch (error) {
      console.error('获取计划失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取当前月份的所有计划（用于月历显示）
  const fetchMonthPlans = async (date) => {
    try {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const startDate = `${year}-${month}-01`
      
      // 获取整个月的计划（简化实现，实际应该获取整月范围）
      const monthPlans = []
      for (let day = 1; day <= 31; day++) {
        const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`
        try {
          const dayPlans = await api.getPlans(dateStr)
          monthPlans.push(...dayPlans)
        } catch (error) {
          // 忽略无效日期的错误
        }
      }
      return monthPlans
    } catch (error) {
      console.error('获取月计划失败:', error)
      return []
    }
  }

  // 刷新整月计划
  const refreshMonthPlans = async () => {
    const data = await fetchMonthPlans(currentDate)
    setMonthPlans(data)
  }

  // 添加新计划
  const handleAddPlan = async (content) => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const newPlan = await api.addPlan(content, dateStr)
      setPlans([...plans, newPlan])
      await refreshMonthPlans()
    } catch (error) {
      console.error('添加计划失败:', error)
      alert('添加计划失败，请重试')
    }
  }

  // 更新计划
  const handleUpdatePlan = async (id, updates) => {
    try {
      const updatedPlan = await api.updatePlan(id, updates)
      setPlans(plans.map(plan => 
        plan.id === id ? { ...plan, ...updatedPlan } : plan
      ))
      await refreshMonthPlans()
    } catch (error) {
      console.error('更新计划失败:', error)
      alert('更新计划失败，请重试')
    }
  }

  // 删除计划（确认在 PlanList 中处理）
  const handleDeletePlan = async (id) => {
    try {
      await api.deletePlan(id)
      setPlans(plans.filter(plan => plan.id !== id))
      await refreshMonthPlans()
    } catch (error) {
      console.error('删除计划失败:', error)
      alert('删除计划失败，请重试')
    }
  }

  // 日期选择处理
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    fetchPlans(date)
  }

  // 月份切换处理
  const handleMonthChange = (newDate) => {
    setCurrentDate(newDate)
    // 如果选中的日期不在新的月份，调整到该月的第一天
    if (newDate.getMonth() !== selectedDate.getMonth() || 
        newDate.getFullYear() !== selectedDate.getFullYear()) {
      const newSelectedDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
      setSelectedDate(newSelectedDate)
      fetchPlans(newSelectedDate)
    }
  }

  // 初始化
  useEffect(() => {
    fetchPlans(selectedDate)
  }, [selectedDate])

  // 获取当前月份的整月计划并传递给日历
  useEffect(() => {
    (async () => {
      const data = await fetchMonthPlans(currentDate)
      setMonthPlans(data)
    })()
  }, [currentDate])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            个人月计划管理
          </h1>
          <p className="text-gray-600">
            高效管理您的每月计划，让生活更有条理
          </p>
        </div>

        {/* 月份导航 */}
        <MonthNavigation 
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
        />

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 月历 */}
          <div className="lg:col-span-2">
            <Calendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              monthPlans={monthPlans}
            />
          </div>

          {/* 计划列表 */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {format(selectedDate, 'yyyy年MM月dd日')} 的计划
              </h3>
              {loading && plans.length === 0 ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-gray-500">加载中...</p>
                </div>
              ) : null}
            </div>
            
            <PlanList
              plans={plans}
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">使用说明：</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 点击月历中的日期查看该日计划</li>
            <li>• 在右侧计划列表中添加、编辑、删除计划</li>
            <li>• 使用复选框标记计划完成状态</li>
            <li>• 点击月份导航切换不同月份</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App