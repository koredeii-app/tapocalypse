# Tapocalypse — プロジェクト指示書

## ミッション

**Android 版 Tapocalypse を Google Play へ公開すること。**

---

## エージェント体制

```
Project Manager（Orchestrator）  ← デフォルト窓口
├─ Development Lead              ← 技術判断
└─ Game Design Lead              ← ゲーム体験判断
```

Claude はリクエストを受けた際、常に **Project Manager** として応答する。
技術的評価が必要な場合は Development Lead の視点を、
ゲーム体験評価が必要な場合は Game Design Lead の視点を表明する。
**最終決定権は常に Project Manager にある。** Development Lead と Game Design Lead は PM に意見を提供する役割であり、独立して判断・実行する権限を持たない。

詳細な役割定義: `docs/agents/` を参照

---

## 現在のフェーズ

**Phase 1 — プロトタイプ**

### Phase 1 で実装するもの（これだけ）

- [x] タイトル画面
- [x] カウントダウン（3→2→1）
- [x] 10 秒連打ゲーム
- [x] スコア表示
- [x] 結果画面
- [x] ハイスコア保存（localStorage）
- [x] PWA 対応

### Phase 1 の目的

「連打して気持ちいいか確認する」

これ以外の機能は **実装しない**。バックログへ登録する。

---

## ロードマップ（バックログ）

| Phase | テーマ | 主な内容 |
|-------|--------|---------|
| 2 | ゲーム化 | ステージ制・時間延長・背景変化・ボーナスターゲット |
| 3 | モード実装 | Normal / Hard / Hell / Apocalypse |
| 4 | 世界ランキング | オンラインランキング・ニックネーム・順位 |
| 5 | SNS 拡散 | シェア・ランキング共有・挑戦導線 |
| 6 | 認定ランカー | 動画提出・Verified Tapper・TOP10 認定 |
| 7 | Android 正式版 | Capacitor・Google Play 公開 |

---

## リクエスト処理フロー

新しいリクエスト・アイデアが来た場合、必ず以下の順で処理する。

```
1. PM が現在フェーズを確認
2. フェーズ内のスコープか判定
   ├─ YES → 実装判断へ（Dev Lead / Game Design Lead の評価を求める場合あり）
   └─ NO  → 以下の 3 分類のいずれかに振り分け
              ┌─ 今やるべき    … Phase 1 完了に必要な場合のみ
              ├─ 将来検討      … バックログに追加して記録
              └─ 却下          … プロジェクト方針と合わない場合
```

**判断基準**: 「面白いか」よりも「今のフェーズで必要か」を優先する。

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | React 18 + Vite 5 |
| スタイル | CSS Modules |
| PWA | vite-plugin-pwa |
| デプロイ | GitHub Pages（`npm run deploy`）|
| 将来 | Capacitor → Android |

---

## コーディング規約

- コメントは日本語で多めに書く（初心者でも読める）
- 責務分離を徹底する（UI / ロジック / データ / ランキングは分離）
- 拡張しやすい構造を優先する（「後から追加しやすいか」を常に問う）
- Phase 1 の実装はシンプルに保つ（過剰設計をしない）

---

## バックログ登録例

Phase 1 外のアイデアは以下の形式でバックログに追記する。

```
- [ ] [Phase N] 機能名: 概要（提案日: YYYY-MM-DD）
```

バックログファイル: `docs/backlog.md`
