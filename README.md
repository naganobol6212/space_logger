<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Space Logger

学習記録アプリ（React + TypeScript + Vite）。
本番公開は `Vercel + Supabase(Auth + Postgres)` を前提にしています。

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example`
3. Set Supabase env vars in `.env.local`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. (Optional) Set `GEMINI_API_KEY`
3. Run the app:
   `npm run dev`

## Supabase Setup (Required)

1. Create a Supabase project
2. Run SQL in `supabase/schema.sql` (SQL Editor)
3. Enable providers in `Authentication > Providers`
   - Email
   - GitHub
4. Configure redirect URLs in `Authentication > URL Configuration`
   - Local: `http://localhost:3000/login`
   - Production: `https://<your-domain>/login`
5. Copy project URL and anon key into env vars

## Deploy (Vercel Recommended)

1. Push repository to GitHub
2. Import project in Vercel
3. Set Environment Variables in Vercel Project Settings
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (optional)
4. Deploy
5. Add production callback URL in Supabase:
   - `https://<your-vercel-domain>/login`

## GitHub Pages (Legacy)

`main` push で GitHub Actions により `dist/` を配信する設定（`.github/workflows/deploy-pages.yml`）も残しています。
本番運用は Vercel を推奨です。

## 学習ログ改修（確認チェックリスト）

### デフォルトログが入らないこと
- **新規登録直後**の `履歴` が **0件**である
- **新規登録直後**の `分析` が「学習していない」状態として表示される（棒グラフが不自然に伸びない）

### 追加 → 即反映
- `記録` で1件追加すると、`履歴` と `分析` に即反映される

### 編集 → 即反映
- `履歴` の各ログで **編集** を開き、以下を変更して **保存** できる
  - title
  - duration（入力例: `90分` / `1.5時間` / `2時間30分` / `2ポモドーロ`）
  - learningType（input / output / both）
  - 日付（timestamp）
- 保存直後に `履歴` と `分析`（棒グラフ/集計）が即時更新される

### 削除 → 即反映
- `履歴` の各ログで **削除** を押すと確認ダイアログが出る
- OK を押すと削除され、`履歴` と `分析` が即時更新される

### ユーザー切替で混在しないこと（userId分離）
- ユーザーAでログを作成 → ログアウト → ユーザーBでログイン
  - ユーザーBの `履歴` は **Aのログが混ざらない**
  - ユーザーBのログが無ければ `履歴` は **0件**（空配列）
- 再度ユーザーAでログインすると、Aのログのみ表示される
