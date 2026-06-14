# Tapocalypse

> 世界を叩け！ — 制限時間内にひたすらタップしてスコアを稼ぐ連打ゲーム

## 概要

| 項目 | 内容 |
|------|------|
| フレームワーク | React 18 + Vite 5 |
| スタイル | CSS Modules |
| PWA | vite-plugin-pwa（manifest + Service Worker 自動生成） |
| 対応環境 | スマートフォン（縦画面） / PWA ホーム画面追加 / オフライン動作 |
| 将来対応 | Capacitor で Android アプリ化可能な構成 |

---

## 開発方法

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（ http://localhost:5173/tapocalypse/ ）
npm run dev
```

開発中は Hot Module Replacement（HMR）が有効なので、
ファイルを保存するとブラウザが即座に反映されます。

---

## ビルド方法

```bash
# 本番ビルド（dist/ フォルダに出力）
npm run build

# ビルド結果をローカルでプレビュー
npm run preview
```

---

## GitHub Pages への公開方法

### 方法 1 — gh-pages コマンド（推奨）

```bash
npm run deploy
```

`dist/` フォルダの内容が `gh-pages` ブランチに push されます。  
初回は GitHub リポジトリの **Settings → Pages → Source** を  
`gh-pages ブランチ / root` に設定してください。

公開 URL: `https://<ユーザー名>.github.io/tapocalypse/`

### 方法 2 — GitHub Actions（自動デプロイ）

`.github/workflows/deploy.yml` を作成して自動化できます。  
詳細は [GitHub Pages 公式ドキュメント](https://docs.github.com/ja/pages) を参照。

---

## Capacitor（Android アプリ化）への対応

将来 Android アプリとして公開する際の手順（Phase 2 以降）:

1. `vite.config.js` の `base` を `'./'` に変更してビルド
2. `npm install @capacitor/core @capacitor/cli @capacitor/android`
3. `npx cap init` で初期化
4. `npx cap add android`
5. `npm run build && npx cap sync`
6. `npx cap open android`（Android Studio でビルド）

---

## プロジェクト構造

```
src/
├── components/
│   ├── screens/          # 各画面コンポーネント
│   │   ├── TitleScreen
│   │   ├── CountdownScreen
│   │   ├── GameScreen
│   │   └── ResultScreen
│   └── ui/               # 再利用UIパーツ
│       ├── StarBackground
│       ├── NeonButton
│       └── TapEffectLayer
├── game/
│   ├── config.js         # 全ゲーム定数（ここだけ変えてバランス調整）
│   ├── GameEngine.js     # コアゲームロジック（React 非依存）
│   └── modes/
│       └── normalMode.js # ノーマルモード（将来: hard/hell/apocalypse）
├── hooks/
│   ├── useGame.js        # ゲーム状態管理（状態 ↔ エンジンの橋渡し）
│   └── useStorage.js     # ハイスコア永続化（将来: ランキング API に差替え可）
├── styles/
│   └── globals.css       # テーマ変数・リセット・共通スタイル
├── App.jsx               # 画面ルーティング
└── main.jsx              # エントリーポイント
```

---

## フェーズ設計

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 1 | 基本連打ゲーム（現在） | ✅ 実装済 |
| Phase 2 | ランキング・ニックネーム登録 | 未実装 |
| Phase 3 | ステージ制・Hard/Hell モード | 未実装 |
| Phase 4 | Apocalypse モード・SNS 共有 | 未実装 |
| Phase 5 | Capacitor Android アプリ化 | 未実装 |
