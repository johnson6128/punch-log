'use client'

import { useState } from 'react'
import {
  initialCorrectionRequests, initialPunchRecords, employees,
  calcWorkMinutes, formatMinutes,
  type CorrectionRequest,
} from '@/lib/stub-data'

const ME_NAME = '鈴木 花子'
const MY_TEAM_IDS = [1, 3, 4, 8]
const TODAY = '2026-05-30'

type Tab = 'requests' | 'alerts' | 'team'

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{children}</span>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>{children}</div>
}

export default function ManagerPage() {
  const [tab, setTab] = useState<Tab>('requests')
  const [requests, setRequests] = useState<CorrectionRequest[]>(initialCorrectionRequests)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [contactedIds, setContactedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')

  const handleApprove = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    showToast('申請を承認しました')
  }

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) return
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'rejected', rejectionReason: rejectReason } : r
    ))
    setRejectingId(null)
    setRejectReason('')
    showToast('申請を却下しました')
  }

  // Missing punch today
  const todayPunches = initialPunchRecords.filter(p => p.date === TODAY)
  const missingClockOut = MY_TEAM_IDS
    .map(id => {
      const emp = employees.find(e => e.id === id)
      const punch = todayPunches.find(p => p.employeeId === id)
      return { emp, punch }
    })
    .filter(({ punch }) => punch && punch.clockIn && !punch.clockOut)

  const noPunch = MY_TEAM_IDS
    .map(id => {
      const emp = employees.find(e => e.id === id)
      const punch = todayPunches.find(p => p.employeeId === id)
      return { emp, punch }
    })
    .filter(({ punch }) => !punch)

  // Team monthly summary
  const teamSummary = MY_TEAM_IDS.map(id => {
    const emp = employees.find(e => e.id === id)!
    const myPunches = initialPunchRecords.filter(p => p.employeeId === id && p.date.startsWith('2026-05'))
    const workedDays = myPunches.filter(p => p.clockIn && p.clockOut).length
    const totalMin = myPunches
      .filter(p => p.clockIn && p.clockOut)
      .reduce((sum, p) => sum + calcWorkMinutes(p.clockIn!, p.clockOut!), 0)
    const overtimeMin = Math.max(0, totalMin - workedDays * 480)
    return { emp, workedDays, totalMin, overtimeMin }
  })

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'requests', label: '申請承認', count: pendingRequests.length },
    { key: 'alerts', label: '打刻漏れアラート', count: noPunch.length },
    { key: 'team', label: 'チーム勤怠' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{ME_NAME}</h1>
          <p className="text-sm text-gray-500">開発部テックリード / 上司ロール</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <p className="text-2xl font-bold text-amber-700">{pendingRequests.length}</p>
            <p className="text-xs text-amber-600">承認待ち</p>
          </div>
          <div className="text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            <p className="text-2xl font-bold text-red-700">{noPunch.length}</p>
            <p className="text-xs text-red-600">未打刻</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === t.key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: 申請承認 ─────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 && (
            <Card>
              <p className="text-sm text-gray-400 text-center py-4">承認待ちの申請はありません</p>
            </Card>
          )}
          {pendingRequests.map(req => (
            <Card key={req.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{req.employeeName}</span>
                    <Badge color="bg-amber-100 text-amber-700">承認待ち</Badge>
                  </div>
                  <p className="text-xs text-gray-400">{req.date.replace(/-/g, '/')} の打刻修正 · 申請: {req.createdAt}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 bg-gray-50 rounded-lg p-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">修正前</p>
                  <p className="font-mono text-gray-600">
                    {req.originalClockIn ?? '--:--'} → {req.originalClockOut ?? <span className="text-amber-600">未退勤</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">修正後（申請）</p>
                  <p className="font-mono font-medium text-gray-800">
                    {req.requestedClockIn ?? '--:--'} → {req.requestedClockOut ?? '--:--'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">修正理由</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{req.reason}</p>
              </div>

              {rejectingId === req.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">却下理由 *</label>
                    <textarea
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                      placeholder="却下理由を入力してください"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={!rejectReason.trim()}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-40"
                    >
                      却下する
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason('') }}
                      className="text-sm text-gray-500 px-4 py-2"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                  >
                    承認
                  </button>
                  <button
                    onClick={() => setRejectingId(req.id)}
                    className="border border-red-300 text-red-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
                  >
                    却下
                  </button>
                </div>
              )}
            </Card>
          ))}

          {processedRequests.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">処理済み申請</h2>
              <div className="space-y-2">
                {processedRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="font-medium text-gray-700">{req.employeeName}</span>
                      <span className="text-gray-400 ml-2">{req.date.replace(/-/g, '/')} の打刻修正</span>
                    </div>
                    <Badge color={req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {req.status === 'approved' ? '承認済み' : '却下'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Tab: 打刻漏れアラート ──────────────────────────────────────── */}
      {tab === 'alerts' && (
        <div className="space-y-4">
          {/* No punch at all */}
          {noPunch.length > 0 && (
            <Card>
              <h2 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                本日 未出勤
              </h2>
              <div className="space-y-3">
                {noPunch.map(({ emp }) => emp && (
                  <div key={emp.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.department} / {emp.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contactedIds.has(emp.id) ? (
                        <Badge color="bg-green-100 text-green-700">連絡済み</Badge>
                      ) : (
                        <button
                          onClick={() => setContactedIds(prev => new Set([...prev, emp.id]))}
                          className="text-xs bg-white border border-gray-300 text-gray-600 rounded-lg px-3 py-1.5 hover:bg-gray-50"
                        >
                          連絡済みにする
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Clocked in but no clock out (end of day check) */}
          {missingClockOut.length > 0 && (
            <Card>
              <h2 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                退勤打刻なし（出勤のみ）
              </h2>
              <div className="space-y-3">
                {missingClockOut.map(({ emp, punch }) => emp && (
                  <div key={emp.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">出勤: {punch?.clockIn}</p>
                    </div>
                    <Badge color="bg-amber-100 text-amber-700">出勤中</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {noPunch.length === 0 && missingClockOut.length === 0 && (
            <Card>
              <p className="text-sm text-green-600 text-center py-4">本日のアラートはありません ✓</p>
            </Card>
          )}
        </div>
      )}

      {/* ── Tab: チーム勤怠 ───────────────────────────────────────────── */}
      {tab === 'team' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">チーム勤怠サマリー — 2026年5月</h2>
            <button className="text-xs text-blue-600 border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-50">
              CSV出力
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium">氏名</th>
                  <th className="text-left py-2 pr-4 font-medium">所属</th>
                  <th className="text-right py-2 pr-4 font-medium">出勤日数</th>
                  <th className="text-right py-2 pr-4 font-medium">総勤務時間</th>
                  <th className="text-right py-2 pr-4 font-medium">残業時間</th>
                  <th className="text-right py-2 font-medium">本日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teamSummary.map(({ emp, workedDays, totalMin, overtimeMin }) => {
                  const todayP = initialPunchRecords.find(p => p.employeeId === emp.id && p.date === TODAY)
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-800">{emp.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{emp.position}</td>
                      <td className="py-3 pr-4 text-right text-gray-700">{workedDays}日</td>
                      <td className="py-3 pr-4 text-right text-gray-700">{formatMinutes(totalMin)}</td>
                      <td className="py-3 pr-4 text-right">
                        <span className={overtimeMin > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'}>
                          {overtimeMin > 0 ? formatMinutes(overtimeMin) : '−'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {!todayP ? (
                          <Badge color="bg-red-100 text-red-600">未出勤</Badge>
                        ) : !todayP.clockOut ? (
                          <Badge color="bg-green-100 text-green-700">出勤中</Badge>
                        ) : (
                          <Badge color="bg-gray-100 text-gray-600">退勤済</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-full text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
