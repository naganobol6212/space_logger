<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1jwhlwPnI1yumruvSPG5gcxVuEQ2sfWa_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

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
