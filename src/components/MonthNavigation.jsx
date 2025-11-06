import React from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MonthNavigation = ({ currentDate, onMonthChange }) => {
  const handlePreviousMonth = () => {
    onMonthChange(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    onMonthChange(new Date())
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousMonth}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="上一月"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
          </h2>
          
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            今天
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="下一月"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default MonthNavigation