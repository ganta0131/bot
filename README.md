# 小島健太郎 模擬面接チャットボット

このプロジェクトは、採用担当者が小島健太郎さんに質問できるチャットボットアプリケーションです。Next.js 14とGemini 1.5 Flashを使用して構築されています。

## 機能

- 自然な会話形式での質問応答
- レスポンシブデザイン（スマートフォン対応）
- 会話の流れを維持した対話
- ローディングインジケーター付き

## セットアップ手順

1. リポジトリをクローン
   ```bash
   git clone [リポジトリURL]
   cd kojima-chatbot
   ```

2. 依存関係をインストール
   ```bash
   npm install
   # または
   yarn install
   ```

3. 環境変数を設定
   `.env.local` ファイルを作成し、以下の内容を記述
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. 開発サーバーを起動
   ```bash
   npm run dev
   # または
   yarn dev
   ```

5. ブラウザで `http://localhost:3000` にアクセス

## デプロイ

Vercelにデプロイするには、以下の手順に従ってください。

1. Vercelにログイン
2. 新しいプロジェクトを作成
3. GitHubリポジトリをインポート
4. 環境変数に `GOOGLE_API_KEY` を設定
5. デプロイを実行

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Generative AI (Gemini 1.5 Flash)

## ライセンス

MIT
