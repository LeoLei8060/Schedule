import React from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const Calendar = ({ currentDate, selectedDate, onDateSelect, monthPlans }) => {
  // 获取月历显示的起始和结束日期
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // 周一开始
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // 获取月历中的所有日期
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // 获取指定日期的计划列表
  const getDayPlans = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return monthPlans.filter(plan => plan.plan_date === dateStr)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['一', '二', '三', '四', '五', '六', '日'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          const dayPlans = getDayPlans(day)

          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                relative p-4 sm:p-5 min-h-[90px] sm:min-h-[110px] text-left cursor-pointer rounded-lg transition-all duration-200 hover:bg-gray-50 border
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200'}
                ${isToday && !isSelected ? 'ring-2 ring-primary-300' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {format(day, 'd')}
                </span>
                {dayPlans.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">
                    {dayPlans.length} 项
                  </span>
                )}
              </div>

              {/* 计划列表（最多显示3条） */}
              {dayPlans.length > 0 ? (
                <ul className="space-y-1">
                  {dayPlans.slice(0, 3).map(plan => (
                    <li key={plan.id} className="text-xs truncate text-gray-700">
                      {plan.completed ? (
                        <span className="line-through text-gray-400">{plan.content}</span>
                      ) : (
                        <span>{plan.content}</span>
                      )}
                    </li>
                  ))}
                  {dayPlans.length > 3 && (
                    <li className="text-xs text-gray-500">… 还剩 {dayPlans.length - 3} 项</li>
                  )}
                </ul>
              ) : (
                <div className="text-xs text-gray-400">无计划</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar