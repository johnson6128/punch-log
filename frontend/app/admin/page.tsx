'use client'

import { useState } from 'react'
import { employees as initialEmployees, taskCategories as initialCategories, ROLE_LABELS, type Employee, type TaskCategory } from '@/lib/stub-data'

const ME_NAME = '渡辺 五郎'

type Tab = 'employees' | 'monthly-close' | 'categories'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{children}</span>
}

const ROLE_COLORS: Record<string, string> = {
  employee: 'bg-gray-100 text-gray-600',
  manager: 'bg-purple-100 text-purple-700',
  sales: 'bg-yellow-100 text-yellow-700',
  project_manager: 'bg-green-100 text-green-700',
  executive: 'bg-orange-100 text-orange-700',
  admin: 'bg-red-100 text-red-700',
}

const MONTHS = ['2026-05', '2026-04', '2026-03']

type CloseCheckItem = {
  id: string
  label: string
  count: number
  severity: 'warning' | 'error'
}

const closeChecklist: CloseCheckItem[] = [
  { id: 'punch-correction', label: '未承認の打刻修正申請', count: 2, severity: 'error' },
  { id: 'missing-punch', label: '退勤打刻が存在しない日', count: 1, severity: 'error' },
  { id: 'no-worklog', label: '工数が未登録の打刻セッション', count: 3, severity: 'warning' },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('employees')
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [categories, setCategories] = useState<TaskCategory[]>(initialCategories)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [closedMonths, setClosedMonths] = useState<Set<string>>(new Set())
  const [forcedClose, setForcedClose] = useState(false)
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', department: '', position: '', employmentType: '正社員' as Employee['employmentType'] })
  const [newCategory, setNewCategory] = useState('')
  const [editingRoles, setEditingRoles] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleToggleActive = (id: number) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e))
    showToast('社員ステータスを更新しました')
  }

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) return
    const emp: Employee = {
      id: Date.now(), ...newEmployee,
      roles: ['employee'], active: true,
      hourlyRate: 3000, hireDate: '2026-05-30',
    }
    setEmployees(prev => [...prev, emp])
    setNewEmployee({ name: '', email: '', department: '', position: '', employmentType: '正社員' })
    setShowAddEmployee(false)
    showToast(`${emp.name} を登録しました。招待メールを送信しました。`)
  }

  const handleToggleCategory = (id: number) => {
    const active = categories.filter(c => c.active)
    const target = categories.find(c => c.id === id)
    if (target?.active && active.length <= 1) {
      showToast('有効なカテゴリが0件になるため無効化できません')
      return
    }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
    showToast('カテゴリを更新しました')
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    setCategories(prev => [...prev, { id: Date.now(), name: newCategory.trim(), active: true }])
    setNewCategory('')
    setShowAddCategory(false)
    showToast('カテゴリを追加しました')
  }

  const handleClose = () => {
    setClosedMonths(prev => new Set([...prev, selectedMonth]))
    setForcedClose(false)
    showToast(`${selectedMonth} の月次締め処理を実行しました`)
  }

  const isClosed = closedMonths.has(selectedMonth)
  const hasIssues = closeChecklist.some(c => c.count > 0)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'employees', label: '社員管理' },
    { key: 'monthly-close', label: '月次締め' },
    { key: 'categories', label: 'タスクカテゴリ' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{ME_NAME}</h1>
        <p className="text-sm text-gray-500">総務部 / システム管理者</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-gray-700 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: 社員管理 ─────────────────────────────────────────────── */}
      {tab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">全 {employees.length} 名（有効: {employees.filter(e => e.active).length} 名）</p>
            <button onClick={() => setShowAddEmployee(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
              + 社員を登録
            </button>
          </div>

          {showAddEmployee && (
            <Card>
              <h3 className="font-semibold text-gray-800 mb-4">社員登録</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">氏名 *</label>
                  <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    placeholder="山田 太郎"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">メールアドレス *</label>
                  <input type="email" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    placeholder="yamada@example.com"
                    value={newEmployee.email}
                    onChange={e => setNewEmployee(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">所属部署</label>
                  <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    placeholder="開発部"
                    value={newEmployee.department}
                    onChange={e => setNewEmployee(prev => ({ ...prev, department: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">職位</label>
                  <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    placeholder="エンジニア"
                    value={newEmployee.position}
                    onChange={e => setNewEmployee(prev => ({ ...prev, position: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">雇用形態</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white"
                    value={newEmployee.employmentType}
                    onChange={e => setNewEmployee(prev => ({ ...prev, employmentType: e.target.value as Employee['employmentType'] }))}>
                    <option>正社員</option>
                    <option>契約社員</option>
                    <option>派遣社員</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddEmployee}
                  disabled={!newEmployee.name || !newEmployee.email}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
                  登録して招待メール送信
                </button>
                <button onClick={() => setShowAddEmployee(false)} className="text-sm text-gray-500 px-4 py-2">
                  キャンセル
                </button>
              </div>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-medium">氏名</th>
                    <th className="text-left py-2 pr-4 font-medium">所属 / 職位</th>
                    <th className="text-left py-2 pr-4 font-medium">ロール</th>
                    <th className="text-left py-2 pr-4 font-medium">雇用形態</th>
                    <th className="text-left py-2 pr-4 font-medium">入社日</th>
                    <th className="text-left py-2 pr-4 font-medium">ステータス</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map(emp => (
                    <tr key={emp.id} className={`hover:bg-gray-50 ${!emp.active ? 'opacity-50' : ''}`}>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-800">{emp.name}</div>
                        <div className="text-xs text-gray-400">{emp.email}</div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        <div>{emp.department}</div>
                        <div className="text-xs text-gray-400">{emp.position}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {emp.roles.filter(r => r !== 'employee').map(r => (
                            <Badge key={r} color={ROLE_COLORS[r] ?? 'bg-gray-100 text-gray-600'}>
                              {ROLE_LABELS[r] ?? r}
                            </Badge>
                          ))}
                          {emp.roles.length === 1 && emp.roles[0] === 'employee' && (
                            <Badge color="bg-gray-100 text-gray-500">一般</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge color={
                          emp.employmentType === '正社員' ? 'bg-blue-50 text-blue-700' :
                          emp.employmentType === '契約社員' ? 'bg-purple-50 text-purple-700' :
                          'bg-orange-50 text-orange-700'
                        }>{emp.employmentType}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">{emp.hireDate}</td>
                      <td className="py-3 pr-4">
                        <Badge color={emp.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}>
                          {emp.active ? '有効' : '無効'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="text-xs text-blue-600 hover:underline">編集</button>
                          <button
                            onClick={() => handleToggleActive(emp.id)}
                            className={`text-xs hover:underline ${emp.active ? 'text-red-500' : 'text-green-600'}`}
                          >
                            {emp.active ? '無効化' : '有効化'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: 月次締め ─────────────────────────────────────────────── */}
      {tab === 'monthly-close' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}>
              {MONTHS.map(m => (
                <option key={m} value={m}>{m.replace('-', '年')}月</option>
              ))}
            </select>
            {isClosed && <Badge color="bg-green-100 text-green-700">締め済み</Badge>}
          </div>

          {isClosed ? (
            <Card>
              <div className="text-center py-6">
                <p className="text-green-600 font-semibold text-lg mb-2">✓ {selectedMonth.replace('-', '年')}月 締め済み</p>
                <p className="text-sm text-gray-400 mb-4">
                  このデータはロックされています。編集が必要な場合は月次締め解除を実行してください。
                </p>
                <button
                  onClick={() => { setClosedMonths(prev => { const s = new Set(prev); s.delete(selectedMonth); return s }) }}
                  className="border border-amber-400 text-amber-700 px-4 py-2 rounded-lg text-sm hover:bg-amber-50"
                >
                  月次締め解除
                </button>
              </div>
            </Card>
          ) : (
            <>
              <Card>
                <h2 className="font-semibold text-gray-800 mb-4">締め前チェックリスト</h2>
                <div className="space-y-3">
                  {closeChecklist.map(item => (
                    <div key={item.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                      item.count === 0 ? 'bg-green-50 border border-green-100' :
                      item.severity === 'error' ? 'bg-red-50 border border-red-100' :
                      'bg-amber-50 border border-amber-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg ${item.count === 0 ? 'text-green-500' : item.severity === 'error' ? 'text-red-500' : 'text-amber-500'}`}>
                          {item.count === 0 ? '✓' : '⚠'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.count > 0 && (
                          <>
                            <span className={`text-sm font-bold ${item.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                              {item.count}件
                            </span>
                            <button className="text-xs text-blue-600 hover:underline">確認する</button>
                          </>
                        )}
                        {item.count === 0 && (
                          <span className="text-sm text-green-600">問題なし</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {hasIssues && !forcedClose && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800 font-medium mb-2">未処理の項目があります</p>
                  <p className="text-xs text-amber-600 mb-3">
                    上記の未処理項目を対処したうえで締め処理を実行することを推奨します。
                    強制実行する場合は以下をチェックしてください。
                  </p>
                  <label className="flex items-center gap-2 text-sm text-amber-700 cursor-pointer">
                    <input type="checkbox" onChange={e => setForcedClose(e.target.checked)} />
                    未処理項目があることを確認したうえで強制実行する
                  </label>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={handleClose}
                  disabled={hasIssues && !forcedClose}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedMonth.replace('-', '年')}月 の月次締め処理を実行
                </button>
                {hasIssues && !forcedClose && (
                  <p className="text-xs text-gray-400">未処理項目をすべて対処するか、強制実行にチェックを入れてください</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: タスクカテゴリ ────────────────────────────────────────── */}
      {tab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {categories.filter(c => c.active).length} 件有効 / {categories.length} 件登録
            </p>
            <button onClick={() => setShowAddCategory(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
              + カテゴリを追加
            </button>
          </div>

          {showAddCategory && (
            <Card>
              <div className="flex items-center gap-3">
                <input type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="カテゴリ名（例: 顧客サポート）"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
                <button onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40">
                  追加
                </button>
                <button onClick={() => setShowAddCategory(false)} className="text-sm text-gray-400 px-2">
                  ✕
                </button>
              </div>
            </Card>
          )}

          <Card>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${cat.active ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${cat.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm font-medium ${cat.active ? 'text-gray-800' : 'text-gray-400'}`}>{cat.name}</span>
                    {!cat.active && <Badge color="bg-gray-100 text-gray-400">無効</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:underline">名称変更</button>
                    <button
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`text-xs hover:underline ${cat.active ? 'text-red-500' : 'text-green-600'}`}
                    >
                      {cat.active ? '無効化' : '有効化'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
