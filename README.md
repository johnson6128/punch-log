# punch-log

Employee time tracking and work log management system

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui |
| ORM | Prisma |
| データベース | PostgreSQL |
| 認証 | Auth.js v5 (NextAuth) |
| バリデーション | Zod |
| テスト | Vitest + Playwright |
| インフラ | Docker + Docker Compose |

## 選定方針

- **Next.js App Router**: フロントとAPIを単一リポジトリで管理。Server Actionsにより打刻処理を簡潔に実装
- **PostgreSQL + Prisma**: 勤怠集計に必要な複雑なJOIN・集計クエリをRDBで処理、型安全なORMでバグを防止
- **Auth.js v5**: ロールベースアクセス制御（一般社員 / 管理者）、将来的なSSOにも対応
- **Zod**: バリデーションスキーマをフロント・バックエンドで共有し、入力チェックを一元化
- **Docker**: 開発・本番環境を統一し、オンプレミスや任意のクラウドへのデプロイを可能にする

## 主な機能（予定）

- 打刻（出勤・退勤・休憩開始・休憩終了）
- 勤怠記録の参照・修正申請
- 従業員・部門管理
- 月次レポート・CSV出力
- 管理者ダッシュボード
