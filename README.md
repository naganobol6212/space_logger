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

## コンセプト

### ◼️ 学習しながら草を生やそう
GitHub の草（コントリビューション）は就活でも注目されることがあります。
「草を生やすために学習する」のではなく、**学習継続の意欲を高める仕組み**として GitHub 連携を取り入れました。
学習を記録するついでに、自然と草が生える体験を目指しています。

### ◼️ インプット・アウトプットのバランスを意識する
学習記録の際にインプット／アウトプットを選択できます。
1週間の履歴を振り返ったとき、「インプットばかりだったな」「アウトプットが少ない」と気づくきっかけになれば、という想いを込めています。
アウトプットはインプットの定着率を大きく左右するので、早いうちから意識できると最高です。

### ◼️ 背景
プログラミングを始めた頃、「草を生やす」の意味すらわかりませんでした。
あるサービスがきっかけで GitHub のコントリビューションを意識するようになり、継続の大切さを実感。
同時に、もっと早くアウトプットしておけばよかった…という後悔もあって、このアプリを作りました。
学習を記録しながら、無理なく草を生やし、アウトプットも意識できる、そんな小さなきっかけになれたら嬉しいです。

---

## ライセンス

MIT
