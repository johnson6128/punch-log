export type Employee = {
  id: number
  name: string
  email: string
  department: string
  position: string
  roles: string[]
  managerId?: number
  active: boolean
  hourlyRate: number
  hireDate: string
  employmentType: '正社員' | '契約社員' | '派遣社員'
}

export type Project = {
  id: string
  name: string
  status: 'proposed' | 'active' | 'completed' | 'closed'
  budgetHours: number
  budgetExpense: number
  contingency: number
  contingencyUsed: number
  revenueTarget: number
  actualRevenue: number
  actualHours: number
  actualExpense: number
  startDate: string
  endDate: string
  managerId: number
  memberIds: number[]
  description: string
}

export type PunchRecord = {
  id: number
  employeeId: number
  date: string
  clockIn: string | null
  clockOut: string | null
  isModified: boolean
}

export type WorkLog = {
  id: number
  employeeId: number
  punchId: number
  projectId: string
  taskCategory: string
  hours: number
  description: string
  date: string
}

export type CorrectionRequest = {
  id: number
  employeeId: number
  employeeName: string
  punchId: number
  date: string
  originalClockIn: string | null
  originalClockOut: string | null
  requestedClockIn: string | null
  requestedClockOut: string | null
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  createdAt: string
}

export type TaskCategory = {
  id: number
  name: string
  active: boolean
}

export type Expense = {
  id: number
  projectId: string
  employeeId: number
  purchaseNo: string
  category: string
  amount: number
  date: string
  description: string
}

// ─── Employees ───────────────────────────────────────────────────────────────

export const employees: Employee[] = [
  {
    id: 1, name: '田中 太郎', email: 'tanaka@example.com',
    department: '開発部', position: 'シニアエンジニア',
    roles: ['employee'], managerId: 2, active: true,
    hourlyRate: 3500, hireDate: '2020-04-01', employmentType: '正社員',
  },
  {
    id: 2, name: '鈴木 花子', email: 'suzuki@example.com',
    department: '開発部', position: 'テックリード',
    roles: ['employee', 'manager'], active: true,
    hourlyRate: 4500, hireDate: '2018-07-01', employmentType: '正社員',
  },
  {
    id: 3, name: '佐藤 次郎', email: 'sato@example.com',
    department: '開発部', position: 'エンジニア',
    roles: ['employee'], managerId: 2, active: true,
    hourlyRate: 2800, hireDate: '2022-04-01', employmentType: '正社員',
  },
  {
    id: 4, name: '山本 三郎', email: 'yamamoto@example.com',
    department: '営業部', position: '営業マネージャー',
    roles: ['employee', 'sales'], managerId: 2, active: true,
    hourlyRate: 3200, hireDate: '2019-01-15', employmentType: '正社員',
  },
  {
    id: 5, name: '伊藤 四郎', email: 'ito@example.com',
    department: '開発部', position: 'プロジェクトマネージャー',
    roles: ['employee', 'project_manager'], managerId: 2, active: true,
    hourlyRate: 5000, hireDate: '2017-04-01', employmentType: '正社員',
  },
  {
    id: 6, name: '渡辺 五郎', email: 'watanabe@example.com',
    department: '総務部', position: 'システム管理者',
    roles: ['employee', 'admin'], active: true,
    hourlyRate: 3000, hireDate: '2016-10-01', employmentType: '正社員',
  },
  {
    id: 7, name: '中村 六子', email: 'nakamura@example.com',
    department: '経営企画部', position: 'CFO',
    roles: ['employee', 'executive'], active: true,
    hourlyRate: 8000, hireDate: '2015-04-01', employmentType: '正社員',
  },
  {
    id: 8, name: '小林 七海', email: 'kobayashi@example.com',
    department: '開発部', position: 'エンジニア',
    roles: ['employee'], managerId: 2, active: true,
    hourlyRate: 2600, hireDate: '2023-10-01', employmentType: '派遣社員',
  },
]

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: 'PJ-001', name: 'ECサイトリニューアル',
    status: 'active',
    budgetHours: 800, budgetExpense: 1500000,
    contingency: 300000, contingencyUsed: 100000,
    revenueTarget: 5000000, actualRevenue: 2000000,
    actualHours: 520, actualExpense: 980000,
    startDate: '2026-03-01', endDate: '2026-08-31',
    managerId: 5, memberIds: [1, 3, 5, 8],
    description: '既存ECサイトのUI/UXリニューアルと機能拡充',
  },
  {
    id: 'PJ-002', name: '基幹システム刷新',
    status: 'active',
    budgetHours: 2000, budgetExpense: 3000000,
    contingency: 500000, contingencyUsed: 0,
    revenueTarget: 12000000, actualRevenue: 4000000,
    actualHours: 650, actualExpense: 1200000,
    startDate: '2026-01-15', endDate: '2026-12-31',
    managerId: 5, memberIds: [1, 2, 3, 5],
    description: '老朽化した基幹業務システムのクラウド移行',
  },
  {
    id: 'PJ-003', name: '社内ツール開発',
    status: 'active',
    budgetHours: 200, budgetExpense: 200000,
    contingency: 50000, contingencyUsed: 0,
    revenueTarget: 0, actualRevenue: 0,
    actualHours: 85, actualExpense: 45000,
    startDate: '2026-04-01', endDate: '2026-06-30',
    managerId: 5, memberIds: [1, 2],
    description: '社内業務効率化ツールの内製開発',
  },
  {
    id: 'PJ-004', name: 'モバイルアプリ開発',
    status: 'proposed',
    budgetHours: 500, budgetExpense: 800000,
    contingency: 150000, contingencyUsed: 0,
    revenueTarget: 3000000, actualRevenue: 0,
    actualHours: 0, actualExpense: 0,
    startDate: '2026-07-01', endDate: '2026-11-30',
    managerId: 5, memberIds: [],
    description: '顧客向けモバイルアプリケーションの新規開発',
  },
]

// ─── Task Categories ──────────────────────────────────────────────────────────

export const taskCategories: TaskCategory[] = [
  { id: 1, name: '開発・実装', active: true },
  { id: 2, name: '設計・レビュー', active: true },
  { id: 3, name: '打ち合わせ・MTG', active: true },
  { id: 4, name: '調査・検証', active: true },
  { id: 5, name: 'テスト・QA', active: true },
  { id: 6, name: 'ドキュメント作成', active: true },
  { id: 7, name: '管理・その他', active: true },
  { id: 8, name: '顧客対応', active: false },
]

// ─── Punch Records ────────────────────────────────────────────────────────────
// Today: 2026-05-30

export const initialPunchRecords: PunchRecord[] = [
  { id: 1, employeeId: 1, date: '2026-05-26', clockIn: '09:03', clockOut: '18:15', isModified: false },
  { id: 2, employeeId: 1, date: '2026-05-27', clockIn: '08:55', clockOut: '19:30', isModified: false },
  { id: 3, employeeId: 1, date: '2026-05-28', clockIn: '09:10', clockOut: '17:45', isModified: false },
  { id: 4, employeeId: 1, date: '2026-05-29', clockIn: '09:00', clockOut: null, isModified: false },
  { id: 5, employeeId: 1, date: '2026-05-30', clockIn: null, clockOut: null, isModified: false },

  { id: 10, employeeId: 2, date: '2026-05-30', clockIn: '09:30', clockOut: null, isModified: false },
  { id: 11, employeeId: 3, date: '2026-05-30', clockIn: '08:45', clockOut: null, isModified: false },
  { id: 12, employeeId: 5, date: '2026-05-30', clockIn: '10:00', clockOut: null, isModified: false },
  { id: 13, employeeId: 8, date: '2026-05-30', clockIn: '09:15', clockOut: null, isModified: false },
  // 山本(id=4) と 伊藤(id=5) のみ未打刻 → アラート対象は id=4 のみ
]

// ─── Work Logs ────────────────────────────────────────────────────────────────

export const initialWorkLogs: WorkLog[] = [
  { id: 1, employeeId: 1, punchId: 1, projectId: 'PJ-001', taskCategory: '開発・実装', hours: 5.5, description: '商品詳細ページのUI実装', date: '2026-05-26' },
  { id: 2, employeeId: 1, punchId: 1, projectId: 'PJ-002', taskCategory: '打ち合わせ・MTG', hours: 2.0, description: '要件定義MTG', date: '2026-05-26' },
  { id: 3, employeeId: 1, punchId: 2, projectId: 'PJ-001', taskCategory: '開発・実装', hours: 6.0, description: 'カート機能実装', date: '2026-05-27' },
  { id: 4, employeeId: 1, punchId: 2, projectId: 'PJ-002', taskCategory: '設計・レビュー', hours: 3.0, description: 'DB設計レビュー', date: '2026-05-27' },
  { id: 5, employeeId: 1, punchId: 3, projectId: 'PJ-001', taskCategory: 'テスト・QA', hours: 3.5, description: '決済フローのテスト', date: '2026-05-28' },
  { id: 6, employeeId: 1, punchId: 3, projectId: 'PJ-003', taskCategory: '開発・実装', hours: 4.0, description: '打刻システムの工数登録機能', date: '2026-05-28' },
]

// ─── Correction Requests ──────────────────────────────────────────────────────

export const initialCorrectionRequests: CorrectionRequest[] = [
  {
    id: 1, employeeId: 1, employeeName: '田中 太郎', punchId: 4,
    date: '2026-05-29',
    originalClockIn: '09:00', originalClockOut: null,
    requestedClockIn: '09:00', requestedClockOut: '18:00',
    reason: '退勤打刻を忘れてしまいました。確かに18:00まで勤務していました。',
    status: 'pending', createdAt: '2026-05-30 09:20',
  },
  {
    id: 2, employeeId: 3, employeeName: '佐藤 次郎', punchId: 99,
    date: '2026-05-28',
    originalClockIn: null, originalClockOut: null,
    requestedClockIn: '08:30', requestedClockOut: '17:30',
    reason: '出勤時にシステムにアクセスできませんでした（ネットワーク障害）。',
    status: 'pending', createdAt: '2026-05-29 14:05',
  },
  {
    id: 3, employeeId: 1, employeeName: '田中 太郎', punchId: 98,
    date: '2026-05-22',
    originalClockIn: '09:35', originalClockOut: '18:00',
    requestedClockIn: '09:15', requestedClockOut: '18:00',
    reason: '出勤打刻時刻が誤っていました。実際には9:15に入室しています。',
    status: 'approved', createdAt: '2026-05-23 10:00',
  },
]

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const initialExpenses: Expense[] = [
  { id: 1, projectId: 'PJ-001', employeeId: 1, purchaseNo: 'PO-20260415-001', category: '外注費', amount: 450000, date: '2026-04-15', description: 'デザイン制作外注' },
  { id: 2, projectId: 'PJ-001', employeeId: 5, purchaseNo: 'PO-20260501-003', category: '消耗品', amount: 35000, date: '2026-05-01', description: 'テスト端末購入' },
  { id: 3, projectId: 'PJ-002', employeeId: 5, purchaseNo: 'PO-20260310-002', category: '外注費', amount: 800000, date: '2026-03-10', description: 'インフラ構築外注' },
  { id: 4, projectId: 'PJ-002', employeeId: 3, purchaseNo: 'PO-20260420-005', category: '交通費', amount: 24000, date: '2026-04-20', description: '顧客先出張交通費（4月分）' },
  { id: 5, projectId: 'PJ-003', employeeId: 1, purchaseNo: 'PO-20260505-001', category: '消耗品', amount: 45000, date: '2026-05-05', description: 'ライセンス費用' },
]

// ─── Monthly Summary (for executive) ─────────────────────────────────────────

export const monthlySummary = [
  { month: '2026-01', revenue: 8200000, cost: 5100000, employees: 7 },
  { month: '2026-02', revenue: 7800000, cost: 4900000, employees: 7 },
  { month: '2026-03', revenue: 9500000, cost: 5800000, employees: 7 },
  { month: '2026-04', revenue: 11200000, cost: 6700000, employees: 8 },
  { month: '2026-05', revenue: 8500000, cost: 5200000, employees: 8 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getEmployeeById(id: number): Employee | undefined {
  return employees.find(e => e.id === id)
}

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}

export function calcWorkMinutes(clockIn: string, clockOut: string): number {
  const [inH, inM] = clockIn.split(':').map(Number)
  const [outH, outM] = clockOut.split(':').map(Number)
  return (outH * 60 + outM) - (inH * 60 + inM)
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

export function formatCurrency(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`
}

export const ROLE_LABELS: Record<string, string> = {
  employee: '社員',
  manager: '上司',
  sales: '営業',
  project_manager: 'PM',
  executive: '経営',
  admin: 'システム管理者',
}

export const STATUS_LABELS: Record<string, string> = {
  proposed: '提案中',
  active: '実行中',
  completed: '完了',
  closed: 'クローズ',
}
