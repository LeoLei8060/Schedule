import React, { useState } from 'react'
import { Trash2, Edit3, Check, X } from 'lucide-react'

const PlanList = ({ plans, onAddPlan, onUpdatePlan, onDeletePlan }) => {
  const [newPlanContent, setNewPlanContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // 添加新计划
  const handleAddPlan = async (e) => {
    e.preventDefault()
    if (newPlanContent.trim()) {
      await onAddPlan(newPlanContent.trim())
      setNewPlanContent('')
    }
  }

  // 开始编辑
  const startEditing = (plan) => {
    setEditingId(plan.id)
    setEditingContent(plan.content)
  }

  // 保存编辑
  const saveEdit = async () => {
    if (editingContent.trim()) {
      await onUpdatePlan(editingId, { content: editingContent.trim() })
      setEditingId(null)
      setEditingContent('')
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null)
    setEditingContent('')
  }

  // 切换完成状态
  const toggleComplete = async (plan) => {
    await onUpdatePlan(plan.id, { completed: !plan.completed })
  }

  // 打开确认弹窗
  const openDeleteConfirm = (id) => {
    setConfirmDeleteId(id)
  }

  // 执行删除
  const confirmDelete = async () => {
    if (!confirmDeleteId) return
    await onDeletePlan(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  // 取消删除
  const cancelDelete = () => {
    setConfirmDeleteId(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">计划列表</h3>
        <span className="text-sm text-gray-500">
          {plans.length} 项计划
        </span>
      </div>

      {/* 添加新计划表单 */}
      <form onSubmit={handleAddPlan} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlanContent}
            onChange={(e) => setNewPlanContent(e.target.value)}
            placeholder="添加新计划..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            添加
          </button>
        </div>
      </form>

      {/* 计划列表 */}
      <div className="space-y-2">
        {plans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无计划</p>
            <p className="text-sm mt-1">添加一个新计划开始吧！</p>
          </div>
        ) : (
          plans.map(plan => (
            <div
              key={plan.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* 完成状态复选框 */}
              <input
                type="checkbox"
                checked={plan.completed}
                onChange={() => toggleComplete(plan)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />

              {/* 计划内容 */}
              <div className="flex-1">
                {editingId === plan.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <span
                    className={`cursor-pointer ${
                      plan.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-800'
                    }`}
                    onClick={() => startEditing(plan)}
                  >
                    {plan.content}
                  </span>
                )}
              </div>

              {/* 操作按钮 */}
              {editingId !== plan.id && (
                <div className="flex gap-1">
                  <button
                    onClick={() => startEditing(plan)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="编辑"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(plan.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 确认删除弹窗 */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={cancelDelete}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-80 p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">确认删除</h4>
            <p className="text-sm text-gray-600 mb-4">确定要删除这个计划吗？此操作不可恢复。</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlanList