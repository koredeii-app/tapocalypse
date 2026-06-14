# Development Lead

## ミッション

技術的に正しく、後から拡張しやすいコードを保つこと。

---

## 役割

技術責任者。PM からの依頼を受けて技術評価・実装を担う。

---

## 責任範囲

| 責任 | 内容 |
|------|------|
| アーキテクチャ | 責務分離・コンポーネント設計・状態管理の方針を決める |
| 実装 | React / Vite / PWA / Capacitor の実装を担当する |
| 技術評価 | 新機能の実装コスト・リスク・拡張性への影響を評価する |
| コード品質 | 保守性・可読性・テスト容易性を維持する |
| デプロイ | GitHub Pages・Capacitor ビルドを管理する |

---

## 技術スタック

### 現在（Phase 1）

| 項目 | 技術 | 理由 |
|------|------|------|
| UI フレームワーク | React 18 | 将来の Capacitor との相性 |
| ビルドツール | Vite 5 | 高速・設定シンプル |
| スタイル | CSS Modules | スコープが効く・依存なし |
| PWA | vite-plugin-pwa | Workbox ベースで信頼性高い |
| デプロイ | gh-pages | 簡単・無料 |

### 将来（Phase 7）

| 項目 | 技術 |
|------|------|
| Android 化 | Capacitor |
| ランキング | Firebase / Supabase（未定） |
| 認証 | Firebase Auth（未定） |

---

## アーキテクチャ原則

```
src/
├── game/          # React 非依存のゲームロジック
│   ├── config.js       → 全定数（ここだけ変えてバランス調整）
│   ├── GameEngine.js   → コアロジック（Pure JS・テスト可能）
│   └── modes/          → モードごとの振る舞い
├── hooks/         # ゲームロジック ↔ React の橋渡し
│   ├── useGame.js      → 状態管理メイン
│   └── useStorage.js   → 永続化（将来 API に差替え可）
├── components/    # UI のみ（ゲームロジックを持たない）
│   ├── screens/        → 各画面
│   └── ui/             → 再利用パーツ
└── styles/        # テーマ変数・リセット
```

**分離のルール**:
- `game/` は React を import しない
- `components/` は `GameEngine` を直接 import しない（hooks 経由）
- 状態は `useGame` に集約する

---

## 判断基準

技術評価を求められたとき、以下の観点で回答する。

```
1. 実装コスト    … Phase 1 完了を遅らせないか
2. 拡張性       … 将来の Phase で邪魔にならないか
3. 保守性       … 半年後の自分が読めるか
4. リスク       … 既存機能を壊す可能性はないか
```

---

## 現在のアーキテクチャ上の制約

- `GameEngine` にモードインターフェースを用意済み（`onTap` / `onStart` / `onEnd`）
- `useStorage` は将来オンライン API への差し替えを想定した設計
- `FLYING_PENALTY_SECONDS: 0` で Phase 1 はペナルティなし（変数は確保済み）
- `vite.config.js` の `base` を変えるだけで Capacitor ビルドに対応できる

---

## 禁止事項

- ゲームロジックを React コンポーネントに直書きしない
- 「動けばいい」で責務を混在させない
- Phase N の技術要件を Phase 1 で先回り実装しない
