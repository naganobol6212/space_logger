<div align="center">

# SPACE LOGGER

**知の深淵へ、いざ発進。未知なる星域を探索せよ。**

学習記録を宇宙探索になぞらえた、エンジニア向けの学習ログ管理アプリです。

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

🚀 **[アプリURL](https://space-logger.vercel.app/)**

</div>

---

## 開発背景

プログラミング学習を継続する中で、日々の学習内容や積み上げを可視化できる仕組みがあれば、振り返りとモチベーション維持の両方に役立つと考え、開発しました。

フロントエンド学習のアウトプットとして React・TypeScript を用いて開発。GitHub OAuth によるログイン機能を実装し、学習ログを記録した際に GitHub API を利用して専用リポジトリへ自動コミットする仕組みを取り入れました。これにより、学習記録と同時に Contribution Graph（草）にも反映され、継続の積み上げを視覚的に確認できます。

また、宇宙をモチーフにした世界観を取り入れることで、記録行為そのものが継続しやすくなるよう、楽しさを感じられる UI を意識しました。

## 使い方

1. **ログイン** — メールアドレスまたは GitHub アカウントでサインイン

   <img src="https://i.gyazo.com/202edbef53dccddc51cc0622d67d4279.png" width="600" />

2. **記録する** — 学習タイトル・時間・タグ・学習タイプ（インプット / アウトプット / 両方）・メモを入力して保存

   <img src="https://i.gyazo.com/3d6c291c36d94ce96a9ccf17f1799b84.png" width="600" />

3. **草が生える** — 記録と同時に GitHub の専用リポジトリへ自動コミット。Contribution Graph に反映される

4. **振り返る** — 履歴ページで過去のログを日付グループ別に確認。検索・編集・削除も可能

   <img src="https://i.gyazo.com/c992cc89f0e484505c3294b55249c39c.png" width="600" />

5. **分析する** — 分析ページで週別学習時間・タグ別内訳・インプット/アウトプット比率をグラフで確認

   <img src="https://i.gyazo.com/89dec51d04e1e9ab04002b77896d13b3.png" width="600" />

## 機能

### 実装済み

| 機能 | 概要 |
|---|---|
| 学習ログ記録 | タイトル・時間・タグ・メモ・学習タイプ（input / output / both）を記録 |
| 履歴管理 | 日付グループ別表示・検索・編集・削除。今週の合計時間をヘッダーに表示 |
| 分析 | 週別学習時間・タグ別内訳・input/output 比率を CSS グラフで可視化 |
| GitHub 連携 | 記録と同時に GitHub リポジトリへ Markdown として自動コミット |
| 認証 | メール＋パスワード / GitHub OAuth の2方式 |
| ダークモード | ライト／ダーク切り替え対応 |

### 今後実装予定

| 機能 | 概要 |
|---|---|
| ホーム画面 | 自分の GitHub Contribution Graph を埋め込んだトップ画面を追加 |
| コミュニティ機能 | 学習ログの公開／非公開設定・一覧表示・リアクション・コメントに対応 |
| ランキング | 学習時間ランキングを実装。草ランキングはキャッシュ設計後に追加予定 |

## 工夫した点

### GitHub Token の Edge Function 移行

当初、GitHub API へのアクセスはブラウザから直接行っていましたが、トークンがブラウザのネットワークタブに露出するリスクがあるため、**Supabase Edge Function（サーバーサイド）にトークンを移管**しました。ブラウザはトークンを持たず、Edge Function 経由でのみ GitHub API を呼び出す構成にすることで、セキュリティを改善しています。

```
ブラウザ → Supabase Edge Function（トークン保持）→ GitHub API
```

### PKCE による OAuth の保護

GitHub OAuth 認証に PKCE（Proof Key for Code Exchange）フローを採用しています。ログイン開始時に生成した乱数（`code_verifier`）をハッシュ化した値を認可サーバーに渡すことで、認可コードを第三者に傍受されても悪用できない仕組みになっています。

### RLS によるデータアクセス制御

Supabase の Row Level Security（RLS）を用いて、DB レベルで「自分のデータにしかアクセスできない」ポリシーを設定しています。フロントエンドのコードに依存せず DB 層でアクセスを制御するため、実装ミスによる情報漏洩を防ぎます。

## 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| フロントエンド | React 19, TypeScript 5.8, Vite 6 |
| スタイリング | Tailwind CSS |
| 認証・DB | Supabase Auth (PKCE), Supabase Postgres (RLS) |
| サーバーレス | Supabase Edge Functions (Deno) |
| デプロイ | Vercel |

---

## ライセンス

MIT
