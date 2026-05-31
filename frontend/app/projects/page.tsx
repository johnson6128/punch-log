'use client'

import { useState } from 'react'
import {
  projects as initialProjects, initialWorkLogs, initialExpenses,
  employees, taskCategories,
  formatCurrency, formatHours,
  type Project, type Expense,
} from '@/lib/stub-data'

const ME_NAME = '伊藤 四郎'
const STATUS_COLORS: Record<string, string> = {
  proposed: 'bg-gray-100 text-gray-600',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-500',
}
const STATUS_LABELS: Record<string, string> = {
  proposed: '提案中', active: '実行中', completed: '完了', closed: 'クローズ',
}

type Tab = 'projects' | 'worklog' | 'expense' | 'report'

type ProjectFormData = {
  name: string
  status: 'proposed' | 'active' | 'completed' | 'closed'
  startDate: string
  endDate: string
  managerId: string
  memberIds: number[]
  description: string
  budgetHours: string
  budgetExpense: string
  contingency: string
  revenueTarget: string
}

const defaultForm: ProjectFormData = {
  name: '',
  status: 'proposed',
  startDate: '2026-06-01',
  endDate: '2026-12-31',
  managerId: '5',
  memberIds: [],
  description: '',
  budgetHours: '',
  budgetExpense: '',
  contingency: '',
  revenueTarget: '',
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{children}</span>
}

function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : color
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  )
}

export default function ProjectsPage() {
  const [tab, setTab] = useState<Tab>('projects')
  const [projects, setProjects] = useState(initialProjects)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showContingencyForm, setShowContingencyForm] = useState<string | null>(null)
  const [newExpense, setNewExpense] = useState({ purchaseNo: '', category: '外注費', amount: '', date: '2026-05-30', description: '' })
  const [contingencyAmount, setContingencyAmount] = useState('')
  const [contingencyTarget, setContingencyTarget] = useState<'hours' | 'expense'>('expense')
  const [contingencyReason, setContingencyReason] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectFormData>(defaultForm)
  const [nameError, setNameError] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const selectedProj = selectedProject ? projects.find(p => p.id === selectedProject) : null

  const openNewProject = () => {
    setEditingProjectId(null)
    setForm(defaultForm)
    setNameError(null)
    setShowProjectForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEditProject = (p: Project) => {
    setEditingProjectId(p.id)
    setForm({
      name: p.name,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      managerId: String(p.managerId),
      memberIds: [...p.memberIds],
      description: p.description,
      budgetHours: String(p.budgetHours),
      budgetExpense: String(p.budgetExpense),
      contingency: String(p.contingency),
      revenueTarget: String(p.revenueTarget),
    })
    setNameError(null)
    setShowProjectForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeProjectForm = () => {
    setShowProjectForm(false)
    setEditingProjectId(null)
    setNameError(null)
  }

  const saveProject = () => {
    if (!form.name.trim()) { setNameError('プロジェクト名は必須です'); return }
    const sameName = projects.filter(p => p.name.trim() === form.name.trim() && p.id !== editingProjectId)
    if (sameName.some(p => p.status === 'active' || p.status === 'proposed')) {
      setNameError('同名のアクティブなプロジェクトが既に存在します')
      return
    }
    if (editingProjectId) {
      setProjects(prev => prev.map(p => p.id !== editingProjectId ? p : {
        ...p,
        name: form.name.trim(),
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        managerId: Number(form.managerId),
        memberIds: form.memberIds,
        description: form.description,
        budgetHours: Number(form.budgetHours) || p.budgetHours,
        budgetExpense: Number(form.budgetExpense) || p.budgetExpense,
        contingency: Number(form.contingency) || p.contingency,
        revenueTarget: Number(form.revenueTarget) || 0,
      }))
      showToast('プロジェクトを更新しました')
    } else {
      const maxNum = projects.reduce((max, p) => Math.max(max, parseInt(p.id.replace('PJ-', '')) || 0), 0)
      const newId = `PJ-${String(maxNum + 1).padStart(3, '0')}`
      setProjects(prev => [...prev, {
        id: newId,
        name: form.name.trim(),
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        managerId: Number(form.managerId),
        memberIds: form.memberIds,
        description: form.description,
        budgetHours: Number(form.budgetHours) || 0,
        budgetExpense: Number(form.budgetExpense) || 0,
        contingency: Number(form.contingency) || 0,
        contingencyUsed: 0,
        revenueTarget: Number(form.revenueTarget) || 0,
        actualRevenue: 0,
        actualHours: 0,
        actualExpense: 0,
      }])
      showToast('プロジェクトを作成しました')
    }
    closeProjectForm()
  }

  const toggleMember = (id: number) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter(m => m !== id)
        : [...prev.memberIds, id],
    }))
  }

  const handleAddExpense = () => {
    if (!newExpense.purchaseNo || !newExpense.amount || !selectedProject) return
    const exp: Expense = {
      id: Date.now(), projectId: selectedProject, employeeId: 5,
      purchaseNo: newExpense.purchaseNo, category: newExpense.category,
      amount: parseInt(newExpense.amount), date: newExpense.date,
      description: newExpense.description,
    }
    setExpenses(prev => [...prev, exp])
    setProjects(prev => prev.map(p =>
      p.id === selectedProject ? { ...p, actualExpense: p.actualExpense + exp.amount } : p
    ))
    setNewExpense({ purchaseNo: '', category: '外注費', amount: '', date: '2026-05-30', description: '' })
    setShowExpenseForm(false)
    showToast('経費を登録しました')
  }

  const handleContingency = () => {
    if (!contingencyAmount || !contingencyReason || !showContingencyForm) return
    const amount = parseInt(contingencyAmount)
    setProjects(prev => prev.map(p => {
      if (p.id !== showContingencyForm) return p
      if (amount > p.contingency - p.contingencyUsed) return p
      return {
        ...p,
        contingencyUsed: p.contingencyUsed + amount,
        ...(contingencyTarget === 'expense' ? { budgetExpense: p.budgetExpense + amount } : { budgetHours: p.budgetHours + Math.floor(amount / 5000) }),
      }
    }))
    setShowContingencyForm(null)
    setContingencyAmount('')
    setContingencyReason('')
    showToast('コンティンジェンシー予備費を取り崩しました')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'projects', label: 'プロジェクト一覧' },
    { key: 'worklog', label: '工数集計' },
    { key: 'expense', label: '経費管理' },
    { key: 'report', label: '収支レポート' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{ME_NAME}</h1>
        <p className="text-sm text-gray-500">開発部 / プロジェクトマネージャー</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: プロジェクト一覧 ─────────────────────────────────────────────── */}
      {tab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openNewProject}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              + 新規プロジェクト
            </button>
          </div>

          {/* Project form (create / edit) */}
          {showProjectForm && (
            <Card className="border-green-200 bg-green-50/30">
              <h3 className="font-semibold text-gray-800 mb-5">
                {editingProjectId ? 'プロジェクト編集' : '新規プロジェクト作成'}
              </h3>

              {/* 基本情報 */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">基本情報</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-600 block mb-1">プロジェクト名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className={`border rounded-lg px-3 py-2 text-sm w-full ${nameError ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="例: 顧客管理システム改修"
                      value={form.name}
                      onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setNameError(null) }}
                    />
                    {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">ステータス</label>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white"
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value as ProjectFormData['status'] }))}
                    >
                      <option value="proposed">提案中</option>
                      <option value="active">実行中</option>
                      <option value="completed">完了</option>
                      <option value="closed">クローズ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">説明</label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                      placeholder="プロジェクトの概要"
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">開始日</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                      value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">終了日</label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                      value={form.endDate}
                      onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* 担当 */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">担当</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">プロジェクト管理者</label>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white"
                      value={form.managerId}
                      onChange={e => setForm(p => ({ ...p, managerId: e.target.value }))}
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-2">メンバー</label>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {employees.filter(e => e.active).map(e => (
                        <label key={e.id} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.memberIds.includes(e.id)}
                            onChange={() => toggleMember(e.id)}
                            className="rounded"
                          />
                          <span className={form.memberIds.includes(e.id) ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                            {e.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 予算 */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">予算</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">工数予算（時間）</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                      placeholder="500"
                      value={form.budgetHours}
                      onChange={e => setForm(p => ({ ...p, budgetHours: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">経費予算（円）</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                      placeholder="1000000"
                      value={form.budgetExpense}
                      onChange={e => setForm(p => ({ ...p, budgetExpense: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">予備費（円）</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                      placeholder="100000"
                      value={form.contingency}
                      onChange={e => setForm(p => ({ ...p, contingency: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">売上目標（円）</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                      placeholder="3000000"
                      value={form.revenueTarget}
                      onChange={e => setForm(p => ({ ...p, revenueTarget: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveProject}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  {editingProjectId ? '更新する' : '作成する'}
                </button>
                <button onClick={closeProjectForm} className="text-sm text-gray-500 px-4 py-2 hover:text-gray-700">
                  キャンセル
                </button>
              </div>
            </Card>
          )}

          {projects.map(p => {
            const hoursPct = Math.min(100, Math.round((p.actualHours / p.budgetHours) * 100))
            const expensePct = Math.min(100, Math.round((p.actualExpense / p.budgetExpense) * 100))
            const revenuePct = p.revenueTarget > 0 ? Math.round((p.actualRevenue / p.revenueTarget) * 100) : null
            const contingencyLeft = p.contingency - p.contingencyUsed

            return (
              <Card key={p.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-mono">{p.id}</span>
                        <Badge color={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                    <div className="text-right text-xs text-gray-400">
                      <p>{p.startDate} 〜</p>
                      <p>{p.endDate}</p>
                    </div>
                    {p.status !== 'closed' && (
                      <button
                        onClick={() => openEditProject(p)}
                        className="text-xs text-blue-600 border border-blue-200 rounded px-2.5 py-1 hover:bg-blue-50 transition-colors"
                      >
                        編集
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>工数予算消化</span>
                      <span>{p.actualHours}h / {p.budgetHours}h</span>
                    </div>
                    <ProgressBar value={p.actualHours} max={p.budgetHours} color="bg-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>経費消化</span>
                      <span>{formatCurrency(p.actualExpense)} / {formatCurrency(p.budgetExpense)}</span>
                    </div>
                    <ProgressBar value={p.actualExpense} max={p.budgetExpense} color="bg-purple-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex gap-4">
                    {revenuePct !== null && (
                      <span>売上: <strong className="text-gray-700">{formatCurrency(p.actualRevenue)}</strong> / {formatCurrency(p.revenueTarget)} ({revenuePct}%)</span>
                    )}
                    <span>予備費残高: <strong className={contingencyLeft < p.contingency * 0.3 ? 'text-red-600' : 'text-gray-700'}>{formatCurrency(contingencyLeft)}</strong></span>
                  </div>
                  {p.status === 'active' && (
                    <button
                      onClick={() => setShowContingencyForm(p.id)}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      予備費取り崩し
                    </button>
                  )}
                </div>

                {/* Contingency form */}
                {showContingencyForm === p.id && (
                  <div className="mt-3 border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-amber-800">コンティンジェンシー予備費の取り崩し</h4>
                    <p className="text-xs text-amber-600">残高: {formatCurrency(contingencyLeft)}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">金額（円） *</label>
                        <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                          placeholder="100000"
                          value={contingencyAmount}
                          onChange={e => setContingencyAmount(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">振替先</label>
                        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white"
                          value={contingencyTarget}
                          onChange={e => setContingencyTarget(e.target.value as 'hours' | 'expense')}>
                          <option value="expense">経費予算</option>
                          <option value="hours">工数予算</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600 block mb-1">理由 *</label>
                        <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                          placeholder="取り崩し理由を入力"
                          value={contingencyReason}
                          onChange={e => setContingencyReason(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleContingency}
                        disabled={!contingencyAmount || !contingencyReason}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-40">
                        実行
                      </button>
                      <button onClick={() => setShowContingencyForm(null)} className="text-sm text-gray-500 px-4 py-2">
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Tab: 工数集計 ─────────────────────────────────────────────── */}
      {tab === 'worklog' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              value={selectedProject ?? ''}
              onChange={e => setSelectedProject(e.target.value || null)}>
              <option value="">全プロジェクト</option>
              {projects.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>2026年5月</option>
              <option>2026年4月</option>
            </select>
          </div>

          {/* By project */}
          {projects.filter(p => p.status === 'active').map(proj => {
            const logs = initialWorkLogs.filter(w => !selectedProject || selectedProject === proj.id)
              .filter(w => w.projectId === proj.id)
            if (logs.length === 0) return null
            const byCategory: Record<string, number> = {}
            logs.forEach(l => { byCategory[l.taskCategory] = (byCategory[l.taskCategory] ?? 0) + l.hours })
            return (
              <Card key={proj.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{proj.name}</h3>
                  <span className="text-sm font-bold text-gray-700">{logs.reduce((s, l) => s + l.hours, 0)}h</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(byCategory).map(([cat, hours]) => (
                    <div key={cat} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-40 shrink-0">{cat}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(hours / logs.reduce((s, l) => s + l.hours, 0)) * 100}%` }} />
                      </div>
                      <span className="font-medium text-gray-700 w-12 text-right">{hours}h</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>工数原価（推定）</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(logs.reduce((s, l) => {
                        const emp = employees.find(e => e.id === l.employeeId)
                        return s + (emp?.hourlyRate ?? 3000) * l.hours
                      }, 0))}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Tab: 経費管理 ─────────────────────────────────────────────── */}
      {tab === 'expense' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              value={selectedProject ?? ''}
              onChange={e => setSelectedProject(e.target.value || null)}>
              <option value="">全プロジェクト</option>
              {projects.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedProject && (
              <button onClick={() => setShowExpenseForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                + 経費を登録
              </button>
            )}
          </div>

          {showExpenseForm && selectedProject && (
            <Card>
              <h3 className="font-semibold text-gray-800 mb-4">経費登録</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">購入No <span className="text-red-500">*</span></label>
                  <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    placeholder="PO-20260530-001"
                    value={newExpense.purchaseNo}
                    onChange={e => setNewExpense(prev => ({ ...prev, purchaseNo: e.target.value }))} />
                  <p className="text-xs text-gray-400 mt-1">外部システムで発行された購入番号（必須）</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">カテゴリ</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white"
                    value={newExpense.category}
                    onChange={e => setNewExpense(prev => ({ ...prev, category: e.target.value }))}>
                    <option>外注費</option>
                    <option>交通費</option>
                    <option>消耗品</option>
                    <option>その他</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">金額（円） *</label>
                  <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    placeholder="50000"
                    value={newExpense.amount}
                    onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">発生日</label>
                  <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    value={newExpense.date}
                    onChange={e => setNewExpense(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-600 block mb-1">摘要</label>
                  <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    placeholder="経費の内容を入力"
                    value={newExpense.description}
                    onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddExpense}
                  disabled={!newExpense.purchaseNo || !newExpense.amount}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40">
                  保存
                </button>
                <button onClick={() => setShowExpenseForm(false)} className="text-sm text-gray-500 px-4 py-2">キャンセル</button>
              </div>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-medium">発生日</th>
                    <th className="text-left py-2 pr-4 font-medium">プロジェクト</th>
                    <th className="text-left py-2 pr-4 font-medium">購入No</th>
                    <th className="text-left py-2 pr-4 font-medium">カテゴリ</th>
                    <th className="text-right py-2 pr-4 font-medium">金額</th>
                    <th className="text-left py-2 font-medium">摘要</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses
                    .filter(e => !selectedProject || e.projectId === selectedProject)
                    .map(e => {
                      const proj = projects.find(p => p.id === e.projectId)
                      return (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="py-3 pr-4 text-gray-600">{e.date}</td>
                          <td className="py-3 pr-4 text-blue-600">{proj?.name}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-gray-500">{e.purchaseNo}</td>
                          <td className="py-3 pr-4">
                            <Badge color="bg-gray-100 text-gray-600">{e.category}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-gray-800">{formatCurrency(e.amount)}</td>
                          <td className="py-3 text-gray-500 text-xs">{e.description}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: 収支レポート ─────────────────────────────────────────── */}
      {tab === 'report' && (
        <div className="space-y-4">
          {projects.filter(p => p.status === 'active').map(p => {
            const logs = initialWorkLogs.filter(w => w.projectId === p.id)
            const laborCost = logs.reduce((s, l) => {
              const emp = employees.find(e => e.id === l.employeeId)
              return s + (emp?.hourlyRate ?? 3000) * l.hours
            }, 0)
            const totalCost = laborCost + p.actualExpense
            const grossProfit = p.actualRevenue - totalCost
            const margin = p.actualRevenue > 0 ? Math.round((grossProfit / p.actualRevenue) * 100) : null
            const contingencyLeft = p.contingency - p.contingencyUsed

            return (
              <Card key={p.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <Badge color={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: '売上', value: formatCurrency(p.actualRevenue), sub: `目標 ${formatCurrency(p.revenueTarget)}`, color: 'text-blue-700' },
                    { label: '原価（工数）', value: formatCurrency(laborCost), sub: `${logs.reduce((s, l) => s + l.hours, 0)}h`, color: 'text-gray-700' },
                    { label: '原価（経費）', value: formatCurrency(p.actualExpense), sub: `予算 ${formatCurrency(p.budgetExpense)}`, color: 'text-gray-700' },
                    { label: '粗利', value: formatCurrency(grossProfit), sub: margin !== null ? `粗利率 ${margin}%` : '—', color: grossProfit >= 0 ? 'text-green-700' : 'text-red-700' },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 font-medium">コンティンジェンシー予備費</span>
                    <span className="text-amber-800 font-bold">{formatCurrency(contingencyLeft)} 残</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-amber-600">
                    <span>当初: {formatCurrency(p.contingency)}</span>
                    <span>取り崩し: {formatCurrency(p.contingencyUsed)}</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-xs text-blue-600 border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-50">
                    CSV出力
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-full text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
