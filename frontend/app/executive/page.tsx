'use client'

import { useState } from 'react'
import { projects, monthlySummary, employees, initialWorkLogs, formatCurrency } from '@/lib/stub-data'

const ME_NAME = '中村 六子'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
}

function KpiCard({ label, value, sub, color = 'text-gray-900' }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <Card>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </Card>
  )
}

export default function ExecutivePage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-05')

  const current = monthlySummary.find(m => m.month === selectedMonth) ?? monthlySummary.at(-1)!
  const prev = monthlySummary.find(m => m.month === '2026-04')!

  const grossProfit = current.revenue - current.cost
  const marginRate = Math.round((grossProfit / current.revenue) * 100)
  const revChange = Math.round(((current.revenue - prev.revenue) / prev.revenue) * 100)

  // Project profitability
  const projectPL = projects.filter(p => p.status === 'active').map(p => {
    const logs = initialWorkLogs.filter(w => w.projectId === p.id)
    const laborCost = logs.reduce((s, l) => {
      const emp = employees.find(e => e.id === l.employeeId)
      return s + (emp?.hourlyRate ?? 3000) * l.hours
    }, 0)
    const totalCost = laborCost + p.actualExpense
    const gp = p.actualRevenue - totalCost
    const rate = p.actualRevenue > 0 ? Math.round((gp / p.actualRevenue) * 100) : null
    return { ...p, laborCost, totalCost, grossProfit: gp, marginRate: rate }
  })

  // Monthly chart max
  const maxRevenue = Math.max(...monthlySummary.map(m => m.revenue))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{ME_NAME}</h1>
          <p className="text-sm text-gray-500">経営企画部 / CFO（読み取り専用ロール）</p>
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {monthlySummary.map(m => (
            <option key={m.month} value={m.month}>
              {m.month.replace('-', '年')}月
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="月次売上"
          value={formatCurrency(current.revenue)}
          sub={`前月比 ${revChange >= 0 ? '+' : ''}${revChange}%`}
          color={revChange >= 0 ? 'text-blue-700' : 'text-red-700'}
        />
        <KpiCard
          label="月次原価"
          value={formatCurrency(current.cost)}
          sub={`売上比 ${Math.round((current.cost / current.revenue) * 100)}%`}
        />
        <KpiCard
          label="粗利"
          value={formatCurrency(grossProfit)}
          sub={`粗利率 ${marginRate}%`}
          color={grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}
        />
        <KpiCard
          label="在籍人数"
          value={`${current.employees}名`}
          sub={`アクティブプロジェクト ${projects.filter(p => p.status === 'active').length}件`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly trend chart */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">月次推移</h2>
          <div className="space-y-4">
            {monthlySummary.map(m => {
              const gp = m.revenue - m.cost
              const gpRate = Math.round((gp / m.revenue) * 100)
              return (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{m.month.slice(5)}月</span>
                    <span>{formatCurrency(m.revenue)}</span>
                  </div>
                  <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-200 rounded-lg"
                      style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-500 rounded-lg"
                      style={{ width: `${(m.cost / maxRevenue) * 100}%` }}
                    />
                    <div className="absolute right-2 top-0 h-full flex items-center text-xs font-medium text-gray-700">
                      粗利 {gpRate}%
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-blue-200 inline-block" />売上
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />原価
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Project PL summary */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">プロジェクト別収益</h2>
          <div className="space-y-4">
            {projectPL.map(p => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  <span className={`text-sm font-bold ${p.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {p.grossProfit >= 0 ? '+' : ''}{formatCurrency(p.grossProfit)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    {p.actualRevenue > 0 ? (
                      <>
                        <div className="h-full bg-green-400 rounded-full float-left"
                          style={{ width: `${(p.grossProfit / p.revenueTarget) * 100}%` }} />
                        <div className="h-full bg-red-300 rounded-full float-left"
                          style={{ width: `${(p.totalCost / p.revenueTarget) * 100}%` }} />
                      </>
                    ) : (
                      <div className="h-full bg-gray-200 rounded-full" style={{ width: '100%' }} />
                    )}
                  </div>
                  <span className="text-xs text-gray-400 w-14 text-right">
                    {p.marginRate !== null ? `粗利 ${p.marginRate}%` : '未計上'}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-gray-400 mt-1">
                  <span>売上: {formatCurrency(p.actualRevenue)}</span>
                  <span>原価: {formatCurrency(p.totalCost)}</span>
                  <span>目標: {formatCurrency(p.revenueTarget)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Headcount & labor cost breakdown */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">人件費内訳（稼働中メンバー）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 pr-4 font-medium">氏名</th>
                <th className="text-left py-2 pr-4 font-medium">雇用形態</th>
                <th className="text-right py-2 pr-4 font-medium">時給単価</th>
                <th className="text-right py-2 pr-4 font-medium">当月工数</th>
                <th className="text-right py-2 font-medium">当月人件費（推定）</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.filter(e => e.active && !e.roles.includes('executive') && !e.roles.includes('admin')).map(emp => {
                const logs = initialWorkLogs.filter(w => w.employeeId === emp.id)
                const totalHours = logs.reduce((s, l) => s + l.hours, 0)
                const laborCost = totalHours * emp.hourlyRate
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{emp.name}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        emp.employmentType === '正社員' ? 'bg-blue-100 text-blue-700' :
                        emp.employmentType === '契約社員' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{emp.employmentType}</span>
                    </td>
                    <td className="py-3 pr-4 text-right text-gray-600">{formatCurrency(emp.hourlyRate)}/h</td>
                    <td className="py-3 pr-4 text-right text-gray-700">{totalHours}h</td>
                    <td className="py-3 text-right font-semibold text-gray-800">{formatCurrency(laborCost)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={3} className="py-3 pr-4 text-sm font-semibold text-gray-700">合計</td>
                <td className="py-3 pr-4 text-right font-bold text-gray-800">
                  {initialWorkLogs.reduce((s, l) => s + l.hours, 0)}h
                </td>
                <td className="py-3 text-right font-bold text-gray-800">
                  {formatCurrency(employees.filter(e => e.active && !e.roles.includes('executive') && !e.roles.includes('admin')).reduce((s, emp) => {
                    const hours = initialWorkLogs.filter(w => w.employeeId === emp.id).reduce((h, l) => h + l.hours, 0)
                    return s + hours * emp.hourlyRate
                  }, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
