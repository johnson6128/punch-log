'use client'

import { useState, useEffect } from 'react'
import {
  initialPunchRecords, initialWorkLogs, initialCorrectionRequests,
  projects, taskCategories, calcWorkMinutes, formatMinutes, formatCurrency,
  type PunchRecord, type WorkLog, type CorrectionRequest,
} from '@/lib/stub-data'

const TODAY = '2026-05-30'
const ME_ID = 1
const ME_NAME = '田中 太郎'

type Tab = 'punch' | 'worklog' | 'history'

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{children}</span>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
}

export default function EmployeePage() {
  const [tab, setTab] = useState<Tab>('punch')
  const [now, setNow] = useState(new Date('2026-05-30T10:23:00'))
  const [punches, setPunches] = useState<PunchRecord[]>(initialPunchRecords)
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs)
  const [corrections, setCorrections] = useState<CorrectionRequest[]>(initialCorrectionRequests)
  const [showWorkLogForm, setShowWorkLogForm] = useState(false)
  const [showCorrectionForm, setShowCorrectionForm] = useState<number | null>(null)
  const [newLog, setNewLog] = useState({ projectId: '', taskCategory: '', hours: '', description: '' })
  const [correction, setCorrection] = useState({ clockIn: '', clockOut: '', reason: '' })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(prev => new Date(prev.getTime() + 1000)), 1000)
    return () => clearInterval(timer)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const todayPunch = punches.find(p => p.employeeId === ME_ID && p.date === TODAY)
  const myHistory = punches.filter(p => p.employeeId === ME_ID && p.date !== TODAY).reverse()
  const todayLogs = workLogs.filter(w => w.employeeId === ME_ID && w.date === TODAY)
  const myCorrections = corrections.filter(c => c.employeeId === ME_ID)

  const status = !todayPunch?.clockIn ? 'none' : !todayPunch?.clockOut ? 'working' : 'done'
  const todayWorkMin = todayPunch?.clockIn && todayPunch?.clockOut
    ? calcWorkMinutes(todayPunch.clockIn, todayPunch.clockOut)
    : todayPunch?.clockIn
    ? calcWorkMinutes(todayPunch.clockIn, `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`)
    : 0

  const handleClockIn = () => {
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    setPunches(prev => prev.map(p =>
      p.employeeId === ME_ID && p.date === TODAY ? { ...p, clockIn: t } : p
    ))
    showToast(`出勤打刻しました（${t}）`)
  }

  const handleClockOut = () => {
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    setPunches(prev => prev.map(p =>
      p.employeeId === ME_ID && p.date === TODAY ? { ...p, clockOut: t } : p
    ))
    showToast(`退勤打刻しました（${t}）`)
    setTab('worklog')
  }

  const handleAddLog = () => {
    if (!newLog.projectId || !newLog.taskCategory || !newLog.hours) return
    const log: WorkLog = {
      id: Date.now(), employeeId: ME_ID, punchId: todayPunch?.id ?? 0,
      projectId: newLog.projectId, taskCategory: newLog.taskCategory,
      hours: parseFloat(newLog.hours), description: newLog.description, date: TODAY,
    }
    setWorkLogs(prev => [...prev, log])
    setNewLog({ projectId: '', taskCategory: '', hours: '', description: '' })
    setShowWorkLogForm(false)
    showToast('工数を登録しました')
  }

  const handleCorrectionSubmit = (punchId: number) => {
    if (!correction.reason) return
    const req: CorrectionRequest = {
      id: Date.now(), employeeId: ME_ID, employeeName: ME_NAME, punchId,
      date: punches.find(p => p.id === punchId)?.date ?? '',
      originalClockIn: punches.find(p => p.id === punchId)?.clockIn ?? null,
      originalClockOut: punches.find(p => p.id === punchId)?.clockOut ?? null,
      requestedClockIn: correction.clockIn || null,
      requestedClockOut: correction.clockOut || null,
      reason: correction.reason, status: 'pending',
      createdAt: `${TODAY} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
    }
    setCorrections(prev => [req, ...prev])
    setShowCorrectionForm(null)
    setCorrection({ clockIn: '', clockOut: '', reason: '' })
    showToast('打刻修正申請を送信しました')
  }

  const cancelCorrection = (id: number) => {
    setCorrections(prev => prev.filter(c => c.id !== id || c.status !== 'pending'))
    showToast('申請を取り消しました')
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const activeCategories = taskCategories.filter(c => c.active)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'punch', label: '打刻' },
    { key: 'worklog', label: '工数登録' },
    { key: 'history', label: '打刻履歴・修正申請' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{ME_NAME}</h1>
          <p className="text-sm text-gray-500">開発部 / シニアエンジニア</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-bold text-gray-800">
            {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}:{String(now.getSeconds()).padStart(2,'0')}
          </p>
          <p className="text-sm text-gray-400">2026年5月30日（金）</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: 打刻 ─────────────────────────────────────────────────── */}
      {tab === 'punch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Punch actions */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 mb-4">本日の打刻</h2>
            <div className="flex flex-col items-center gap-4">
              {status === 'none' && (
                <>
                  <p className="text-gray-500 text-sm">まだ出勤打刻がありません</p>
                  <button
                    onClick={handleClockIn}
                    className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl text-xl transition-colors shadow-md"
                  >
                    出勤打刻
                  </button>
                </>
              )}
              {status === 'working' && (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-semibold">出勤中</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">出勤時刻</p>
                    <p className="text-2xl font-bold font-mono">{todayPunch?.clockIn}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">勤務時間</p>
                    <p className="text-lg font-semibold text-gray-700">{formatMinutes(todayWorkMin)}</p>
                  </div>
                  <button
                    onClick={handleClockOut}
                    className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white font-bold py-5 rounded-2xl text-xl transition-colors shadow-md"
                  >
                    退勤打刻
                  </button>
                </>
              )}
              {status === 'done' && (
                <>
                  <Badge color="bg-gray-100 text-gray-600">退勤済み</Badge>
                  <div className="grid grid-cols-2 gap-6 text-center w-full">
                    <div>
                      <p className="text-xs text-gray-400">出勤</p>
                      <p className="text-xl font-bold font-mono">{todayPunch?.clockIn}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">退勤</p>
                      <p className="text-xl font-bold font-mono">{todayPunch?.clockOut}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">勤務時間</p>
                    <p className="text-lg font-semibold text-gray-700">{formatMinutes(todayWorkMin)}</p>
                  </div>
                  <p className="text-sm text-green-600 font-medium">本日の勤務お疲れ様でした</p>
                  <button
                    onClick={() => setTab('worklog')}
                    className="text-sm text-blue-600 underline"
                  >
                    工数を登録する →
                  </button>
                </>
              )}
            </div>
          </Card>

          {/* Today's work log summary */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 mb-4">本日の工数</h2>
            {todayLogs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">工数未登録</p>
            ) : (
              <ul className="space-y-2">
                {todayLogs.map(log => (
                  <li key={log.id} className="flex items-start gap-3 text-sm">
                    <span className="text-gray-400 font-mono w-12 shrink-0">{log.hours}h</span>
                    <div>
                      <span className="font-medium text-gray-700">{log.taskCategory}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-gray-500">{projects.find(p => p.id === log.projectId)?.name}</span>
                      {log.description && <p className="text-gray-400 text-xs mt-0.5">{log.description}</p>}
                    </div>
                  </li>
                ))}
                <li className="pt-2 border-t border-gray-100 text-sm font-semibold text-gray-700">
                  合計: {todayLogs.reduce((s, l) => s + l.hours, 0)}時間
                </li>
              </ul>
            )}
          </Card>
        </div>
      )}

      {/* ── Tab: 工数登録 ──────────────────────────────────────────────── */}
      {tab === 'worklog' && (
        <div className="space-y-4">
          {status === 'none' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              出勤打刻後に工数を登録できます
            </div>
          )}

          {/* Session info */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">打刻セッション — 2026年5月30日</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {todayPunch?.clockIn ?? '--:--'} → {todayPunch?.clockOut ?? '出勤中'}
                  {todayPunch?.clockIn && ` (${formatMinutes(todayWorkMin)})`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">登録工数</p>
                <p className="text-lg font-bold text-gray-700">{todayLogs.reduce((s, l) => s + l.hours, 0)}h</p>
              </div>
            </div>

            {/* Registered logs */}
            <div className="space-y-2 mb-4">
              {todayLogs.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">まだ工数が登録されていません</p>
              ) : (
                todayLogs.map(log => (
                  <div key={log.id} className="flex items-start justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex gap-3 text-sm">
                      <span className="font-mono text-blue-700 font-medium w-10">{log.hours}h</span>
                      <div>
                        <span className="font-medium text-gray-700">{log.taskCategory}</span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="text-blue-600">{projects.find(p => p.id === log.projectId)?.name}</span>
                        {log.description && <p className="text-gray-400 text-xs mt-0.5">{log.description}</p>}
                      </div>
                    </div>
                    <button className="text-xs text-gray-400 hover:text-red-500 ml-2 shrink-0">削除</button>
                  </div>
                ))
              )}
            </div>

            {showWorkLogForm ? (
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
                <h3 className="text-sm font-semibold text-blue-800">工数を追加</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">プロジェクト *</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      value={newLog.projectId}
                      onChange={e => setNewLog(prev => ({ ...prev, projectId: e.target.value }))}
                    >
                      <option value="">選択してください</option>
                      {activeProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">タスクカテゴリ *</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      value={newLog.taskCategory}
                      onChange={e => setNewLog(prev => ({ ...prev, taskCategory: e.target.value }))}
                    >
                      <option value="">選択してください</option>
                      {activeCategories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">作業時間（時間） *</label>
                    <input
                      type="number" min="0.5" max="24" step="0.5"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="例: 2.5"
                      value={newLog.hours}
                      onChange={e => setNewLog(prev => ({ ...prev, hours: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">作業内容（任意）</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="作業内容を簡潔に"
                      value={newLog.description}
                      onChange={e => setNewLog(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                {parseFloat(newLog.hours || '0') + todayLogs.reduce((s, l) => s + l.hours, 0) > todayWorkMin / 60 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                    ⚠ 工数合計が勤務時間を超えています（打刻外の実作業として記録可能です）
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddLog}
                    disabled={!newLog.projectId || !newLog.taskCategory || !newLog.hours}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    保存
                  </button>
                  <button onClick={() => setShowWorkLogForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWorkLogForm(true)}
                disabled={status === 'none'}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">＋</span> 工数を追加
              </button>
            )}
          </Card>

          {/* Past sessions without logs */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">過去の打刻セッション（工数未登録）</h2>
            <div className="space-y-2">
              {[{ id: 4, date: '2026-05-29', clockIn: '09:00', clockOut: null }].map(p => (
                <div key={p.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <div className="text-sm">
                    <span className="font-medium text-amber-800">5月29日（木）</span>
                    <span className="text-amber-600 ml-2">{p.clockIn} → {p.clockOut ?? '未退勤'}</span>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline">工数を登録</button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: 打刻履歴・修正申請 ────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-5">
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 mb-4">打刻履歴（最近30日）</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-medium">日付</th>
                    <th className="text-left py-2 pr-4 font-medium">出勤</th>
                    <th className="text-left py-2 pr-4 font-medium">退勤</th>
                    <th className="text-left py-2 pr-4 font-medium">勤務時間</th>
                    <th className="text-left py-2 font-medium">ステータス</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { id: 5, date: '2026-05-30', day: '金', clockIn: todayPunch?.clockIn ?? null, clockOut: todayPunch?.clockOut ?? null },
                    { id: 4, date: '2026-05-29', day: '木', clockIn: '09:00', clockOut: null },
                    { id: 3, date: '2026-05-28', day: '水', clockIn: '09:10', clockOut: '17:45' },
                    { id: 2, date: '2026-05-27', day: '火', clockIn: '08:55', clockOut: '19:30' },
                    { id: 1, date: '2026-05-26', day: '月', clockIn: '09:03', clockOut: '18:15' },
                  ].map(p => {
                    const min = p.clockIn && p.clockOut ? calcWorkMinutes(p.clockIn, p.clockOut) : null
                    const hasCorrection = myCorrections.find(c => c.punchId === p.id)
                    const missing = !p.clockIn || !p.clockOut
                    return (
                      <tr key={p.id} className={missing ? 'bg-amber-50' : ''}>
                        <td className="py-3 pr-4 font-medium text-gray-700">
                          {p.date.slice(5).replace('-', '/')} ({p.day})
                        </td>
                        <td className="py-3 pr-4 font-mono text-gray-700">{p.clockIn ?? <span className="text-gray-300">--:--</span>}</td>
                        <td className="py-3 pr-4 font-mono text-gray-700">{p.clockOut ?? <span className="text-gray-300">--:--</span>}</td>
                        <td className="py-3 pr-4 text-gray-600">{min ? formatMinutes(min) : <span className="text-amber-600 text-xs">未退勤</span>}</td>
                        <td className="py-3">
                          {hasCorrection ? (
                            <Badge color={
                              hasCorrection.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              hasCorrection.status === 'approved' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {hasCorrection.status === 'pending' ? '申請中' : hasCorrection.status === 'approved' ? '承認済' : '却下'}
                            </Badge>
                          ) : p.date === TODAY ? (
                            <Badge color="bg-blue-100 text-blue-700">本日</Badge>
                          ) : missing ? (
                            <Badge color="bg-amber-100 text-amber-700">要修正</Badge>
                          ) : (
                            <Badge color="bg-gray-100 text-gray-500">確定</Badge>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {(missing || true) && !hasCorrection && p.date !== TODAY && (
                            <button
                              onClick={() => {
                                setShowCorrectionForm(p.id)
                                setCorrection({ clockIn: p.clockIn ?? '', clockOut: p.clockOut ?? '', reason: '' })
                              }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              修正申請
                            </button>
                          )}
                          {hasCorrection?.status === 'pending' && (
                            <button
                              onClick={() => cancelCorrection(hasCorrection.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              取り消し
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Correction request form */}
          {showCorrectionForm !== null && (
            <Card>
              <h2 className="font-semibold text-gray-800 mb-4">打刻修正申請</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">修正後の出勤時刻</label>
                  <input type="time" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    value={correction.clockIn} onChange={e => setCorrection(prev => ({ ...prev, clockIn: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">修正後の退勤時刻</label>
                  <input type="time" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                    value={correction.clockOut} onChange={e => setCorrection(prev => ({ ...prev, clockOut: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-600 block mb-1">修正理由 *</label>
                  <textarea rows={3} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full resize-none"
                    placeholder="修正が必要な理由を入力してください"
                    value={correction.reason} onChange={e => setCorrection(prev => ({ ...prev, reason: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCorrectionSubmit(showCorrectionForm)}
                  disabled={!correction.reason}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
                >
                  申請する
                </button>
                <button onClick={() => setShowCorrectionForm(null)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                  キャンセル
                </button>
              </div>
            </Card>
          )}

          {/* My correction history */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">修正申請履歴</h2>
            {myCorrections.length === 0 ? (
              <p className="text-sm text-gray-400">申請履歴はありません</p>
            ) : (
              <div className="space-y-3">
                {myCorrections.map(c => (
                  <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{c.date.replace(/-/g, '/')} の打刻修正</span>
                        <p className="text-xs text-gray-400 mt-0.5">申請日: {c.createdAt}</p>
                      </div>
                      <Badge color={
                        c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        c.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {c.status === 'pending' ? '承認待ち' : c.status === 'approved' ? '承認済み' : '却下'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                      <div>修正前: {c.originalClockIn ?? '--:--'} → {c.originalClockOut ?? '--:--'}</div>
                      <div>修正後: {c.requestedClockIn ?? '--:--'} → {c.requestedClockOut ?? '--:--'}</div>
                    </div>
                    <p className="text-xs text-gray-600">理由: {c.reason}</p>
                    {c.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">却下理由: {c.rejectionReason}</p>
                    )}
                    {c.status === 'pending' && (
                      <button onClick={() => cancelCorrection(c.id)} className="text-xs text-red-500 hover:underline mt-2">
                        取り消す
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-full text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
