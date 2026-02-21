<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# SPACE LOGGER

**知の深淵へ、いざ発進。未知なる星域を探索せよ。**

学習記録を宇宙探索になぞらえた、エンジニア向けの学習ログ管理アプリです。

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 機能

- **学習ログの記録** — タイトル・時間・タグ・メモ・学習タイプ（input / output / both）を記録
- **分析ダッシュボード** — 日別・カテゴリ別の学習時間をグラフで可視化
- **GitHub 連携** — 学習ログを自分の GitHub リポジトリ（`space-logger`）に Markdown として自動同期
- **認証** — メール＋パスワード登録 / GitHub OAuth の2方式に対応
- **ダークモード** — ライト／ダーク切り替え対応

## 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| フロントエンド | React 19, TypeScript 5.8, Vite 6 |
| スタイリング | Tailwind CSS |
| グラフ | Recharts |
| 認証・DB | Supabase Auth (PKCE), Supabase Postgres (RLS) |
| デプロイ | Vercel |

## ローカル起動

**必要なもの:** Node.js

```bash
# 1. 依存関係をインストール
npm install

# 2. 環境変数ファイルを作成
cp .env.example .env.local

# 3. .env.local に Supabase の値を設定（下記「Supabase セットアップ」参照）

# 4. 開発サーバー起動
npm run dev
```

### 環境変数

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key   # optional
```

## Supabase セットアップ

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. **SQL Editor** で `supabase/schema.sql` を実行（テーブル・RLS ポリシーが作成されます）
3. `Authentication > Providers` で以下を有効化
   - **Email** （メール認証）
   - **GitHub** （OAuth）
4. `Authentication > URL Configuration` でリダイレクト URL を設定
   - ローカル: `http://localhost:5173`
   - 本番: `https://<your-domain>`
5. プロジェクト URL と anon key を `.env.local` にコピー

## デプロイ（Vercel）

1. リポジトリを GitHub に push
2. [Vercel](https://vercel.com/) でプロジェクトをインポート
3. 環境変数を Vercel Project Settings に設定
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`（任意）
4. デプロイ
5. Supabase の `URL Configuration` に本番ドメインを追加

## ライセンス

MIT
