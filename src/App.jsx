import React, { useEffect, useState } from 'react'
import * as api from './lib/api'
import PlanList from './components/PlanList'
import CalendarView from './components/Calendar'
import { format } from 'date-fns'

function App() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [monthPlans, setMonthPlans] = useState([])

  const fetchPlans = async (date) => {
    setLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const data = await api.getPlans(dateStr)
      setPlans(data)
    } catch (err) {
      setError('加载计划失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans(selectedDate)
  }, [selectedDate])

  // 添加时按选中日期
  const handleAddPlan = async (exerciseType, unit, quantity) => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const newPlan = await api.addPlan(exerciseType, unit, quantity, dateStr)
      setPlans(prev => [newPlan, ...prev])
    } catch (err) {
      setError('添加计划失败')
    }
  }

  const handleUpdatePlan = async (id, updates) => {
    try {
      const updated = await api.updatePlan(id, updates)
      setPlans(prev => prev.map(p => (p.id === id ? updated : p)))
    } catch (err) {
      setError('更新计划失败')
    }
  }

  const handleDeletePlan = async (id) => {
    try {
      await api.deletePlan(id)
      setPlans(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError('删除计划失败')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary-600 text-white py-6 shadow">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl font-bold">健身月计划管理</h1>
          <p className="text-sm text-primary-100">记录与管理每月健身计划（类型、单位、数量）</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <PlanList
            plans={plans}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
          />
        </section>
        <section>
          <CalendarView
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={(d) => setSelectedDate(d)}
            monthPlans={monthPlans}
          />
        </section>
      </main>

      {loading && (
        <div className="fixed bottom-4 right-4 bg-white shadow rounded px-3 py-2 text-sm">加载中...</div>
      )}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-50 border border-red-200 text-red-700 shadow rounded px-3 py-2 text-sm">{error}</div>
      )}
    </div>
  )
}

export default App