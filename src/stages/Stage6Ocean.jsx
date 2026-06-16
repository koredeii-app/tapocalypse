/**
 * Stage 6「海」— 惑星表面に海と大地を描いて環境を形成するステージ
 *
 * 操作:
 *   1本指スワイプ → 選択中のエネルギーで地形を塗る
 *   2本指ピンチ   → ズームイン/アウト
 *
 * クリア条件: 惑星表面を100%（海 + 大地）で覆う
 * 時間制限なし。正解は1つではない。
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Stage6Ocean.module.css';

// ── 定数（モジュールレベルで1回だけ計算） ──────────────────────────────────
const GRID_SIZE       = 36;
const PLANET_RADIUS   = 100;       // 自然サイズの惑星半径（px）
const CANVAS_SIZE     = PLANET_RADIUS * 2;
const CELL_SIZE       = CANVAS_SIZE / GRID_SIZE;
const PAINT_RADIUS_PX = 18;        // ブラシ半径（惑星空間 px）
const MIN_ZOOM        = 0.8;
const MAX_ZOOM        = 4.0;

// 惑星内に収まるセルを事前計算
const PLANET_CELLS = [];
{
  const r2 = PLANET_RADIUS * PLANET_RADIUS;
  for (let j = 0; j < GRID_SIZE; j++) {
    for (let i = 0; i < GRID_SIZE; i++) {
      const cx = (i + 0.5) * CELL_SIZE - PLANET_RADIUS;
      const cy = (j + 0.5) * CELL_SIZE - PLANET_RADIUS;
      if (cx * cx + cy * cy <= r2) {
        PLANET_CELLS.push({ i, j, idx: j * GRID_SIZE + i });
      }
    }
  }
}
const TOTAL_CELLS = PLANET_CELLS.length;

// ブラシ半径（グリッド単位）
const BRUSH_R  = PAINT_RADIUS_PX / CELL_SIZE;
const BRUSH_R2 = BRUSH_R * BRUSH_R;

// 惑星表面に隠されたオブジェクト
const HIDDEN_OBJECTS = [
  { id: 'volcano', gridI:  8, gridJ: 12, emoji: '🌋', name: '火山' },
  { id: 'crater',  gridI: 27, gridJ:  9, emoji: '🕳️', name: '巨大クレーター' },
  { id: 'aquifer', gridI: 13, gridJ: 27, emoji: '💧', name: '地下水脈' },
  { id: 'crystal', gridI: 27, gridJ: 25, emoji: '💎', name: '水晶洞窟' },
];

// ── ユーティリティ ─────────────────────────────────────────────────────────
function evaluateWorld(oceanCells, landCells) {
  const o = (oceanCells / TOTAL_CELLS) * 100;
  const l = (landCells  / TOTAL_CELLS) * 100;
  if (o >= 75)               return { name: '海洋世界',     emoji: '🌊', desc: '広大な海に覆われた惑星' };
  if (l >= 75)               return { name: '大陸世界',     emoji: '⛰️', desc: '雄大な大地が広がる惑星' };
  if (o <= 10)               return { name: '砂漠世界',     emoji: '🏜️', desc: '乾いた大地が続く惑星' };
  if (l <= 10)               return { name: '水没世界',     emoji: '💧', desc: 'ほぼ全てが海の惑星' };
  if (Math.abs(o - l) <= 15) return { name: '均衡世界',     emoji: '🌍', desc: '海と大地が均衡した惑星' };
  if (o > l)                 return { name: '海洋優位世界', emoji: '🏝️', desc: '海が優勢な惑星' };
  return                            { name: '陸地優位世界', emoji: '🏔️', desc: '陸地が優勢な惑星' };
}

// ── コンポーネント ─────────────────────────────────────────────────────────
function Stage6Ocean({ active, onClear }) {
  // ─ UI state ─
  const [zoom,          setZoom]          = useState(1);
  const [activeEnergy,  setActiveEnergy]  = useState('ocean');
  const [progress,      setProgress]      = useState({ ocean: 0, land: 0, unexplored: 100 });
  const [discoveryEvent, setDiscoveryEvent] = useState(null);
  const [worldEval,     setWorldEval]     = useState(null);
  const [showNarrative, setShowNarrative] = useState(true);

  // ─ Refs（レンダー外で更新するデータ） ─
  const canvasRef       = useRef(null);
  const cellsRef        = useRef(new Uint8Array(GRID_SIZE * GRID_SIZE)); // 0=未,1=海,2=陸
  const zoomRef         = useRef(1);
  const activeEnergyRef = useRef('ocean');
  const discoveredRef   = useRef(new Set());
  const clearedRef      = useRef(false);
  const pointers        = useRef({});
  const paintModeRef    = useRef(false);
  const rafRef          = useRef(null);
  const discTimerRef    = useRef(null);

  // ── キャンバス描画 ──────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // セル塗り
    for (const { i, j, idx } of PLANET_CELLS) {
      const type = cellsRef.current[idx];
      if (type === 0) continue;
      ctx.fillStyle = type === 1
        ? 'rgba(20, 90, 210, 0.82)'
        : 'rgba(45, 135, 55, 0.82)';
      ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE + 0.5, CELL_SIZE + 0.5);
    }

    // 発見済みオブジェクト
    ctx.font = `${Math.round(CELL_SIZE * 2.2)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    discoveredRef.current.forEach(id => {
      const obj = HIDDEN_OBJECTS.find(o => o.id === id);
      if (!obj) return;
      ctx.fillText(obj.emoji, (obj.gridI + 0.5) * CELL_SIZE, (obj.gridJ + 0.5) * CELL_SIZE);
    });
  }, []);

  // ── 進捗更新 ────────────────────────────────────────────────────────────
  const updateProgress = useCallback(() => {
    let ocean = 0, land = 0;
    for (const { idx } of PLANET_CELLS) {
      const t = cellsRef.current[idx];
      if (t === 1) ocean++;
      else if (t === 2) land++;
    }
    const oceanPct      = Math.round((ocean / TOTAL_CELLS) * 100);
    const landPct       = Math.round((land  / TOTAL_CELLS) * 100);
    const unexploredPct = Math.max(0, 100 - oceanPct - landPct);
    setProgress({ ocean: oceanPct, land: landPct, unexplored: unexploredPct });

    if (ocean + land >= TOTAL_CELLS && !clearedRef.current) {
      clearedRef.current = true;
      setWorldEval(evaluateWorld(ocean, land));
      setTimeout(() => onClear(), 3000);
    }
  }, [onClear]);

  // ── 隠しオブジェクト発見チェック ──────────────────────────────────────────
  const checkDiscovery = useCallback((gx, gy) => {
    for (const obj of HIDDEN_OBJECTS) {
      if (discoveredRef.current.has(obj.id)) continue;
      if (Math.abs(gx - obj.gridI) <= 3 && Math.abs(gy - obj.gridJ) <= 3) {
        discoveredRef.current.add(obj.id);
        drawCanvas();
        if (discTimerRef.current) clearTimeout(discTimerRef.current);
        setDiscoveryEvent(obj);
        discTimerRef.current = setTimeout(() => setDiscoveryEvent(null), 2800);
      }
    }
  }, [drawCanvas]);

  // ── 塗り処理 ──────────────────────────────────────────────────────────────
  const paintAt = useCallback((clientX, clientY) => {
    if (!active || clearedRef.current) return;

    // スクリーン座標 → 惑星空間座標
    const px = (clientX - window.innerWidth  / 2) / zoomRef.current;
    const py = (clientY - window.innerHeight / 2) / zoomRef.current;

    // 惑星空間座標 → グリッド座標
    const gX = px / CELL_SIZE + GRID_SIZE / 2;
    const gY = py / CELL_SIZE + GRID_SIZE / 2;

    const energyType = activeEnergyRef.current === 'ocean' ? 1 : 2;
    let changed = false;

    for (const { i, j, idx } of PLANET_CELLS) {
      const di = i + 0.5 - gX;
      const dj = j + 0.5 - gY;
      if (di * di + dj * dj <= BRUSH_R2) {
        if (cellsRef.current[idx] !== energyType) {
          cellsRef.current[idx] = energyType;
          changed = true;
        }
      }
    }

    if (changed) {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          drawCanvas();
          updateProgress();
          rafRef.current = null;
        });
      }
      checkDiscovery(Math.round(gX), Math.round(gY));
    }
  }, [active, drawCanvas, updateProgress, checkDiscovery]);

  // ── ポインターイベント ────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    pointers.current[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (Object.keys(pointers.current).length === 1) {
      paintModeRef.current = true;
      paintAt(e.clientX, e.clientY);
    } else {
      paintModeRef.current = false;
    }
    setShowNarrative(false);
  }, [paintAt]);

  const handlePointerMove = useCallback((e) => {
    const prevPos = pointers.current[e.pointerId];
    const newPos  = { x: e.clientX, y: e.clientY };
    const ids     = Object.keys(pointers.current);

    if (ids.length >= 2) {
      const otherId = ids.find(id => Number(id) !== e.pointerId);
      if (otherId && prevPos) {
        const otherPos = pointers.current[otherId];
        const prevDist = Math.hypot(prevPos.x - otherPos.x, prevPos.y - otherPos.y);
        const newDist  = Math.hypot(newPos.x  - otherPos.x, newPos.y  - otherPos.y);
        if (prevDist > 0) {
          const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current * (newDist / prevDist)));
          zoomRef.current = nz;
          setZoom(nz);
        }
      }
    } else if (paintModeRef.current) {
      paintAt(e.clientX, e.clientY);
    }

    pointers.current[e.pointerId] = newPos;
  }, [paintAt]);

  const handlePointerUp = useCallback((e) => {
    delete pointers.current[e.pointerId];
    paintModeRef.current = Object.keys(pointers.current).length === 1;
  }, []);

  // ── ナラティブ自動非表示 ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setShowNarrative(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // ── クリーンアップ ────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (rafRef.current)    cancelAnimationFrame(rafRef.current);
    if (discTimerRef.current) clearTimeout(discTimerRef.current);
  }, []);

  // ── 大気グロー色（進捗に応じて変化） ──────────────────────────────────────
  const glowOcean = `rgba(20, 90, 210, ${(0.15 + progress.ocean * 0.006).toFixed(3)})`;
  const glowLand  = `rgba(45, 135, 55, ${(0.10 + progress.land  * 0.005).toFixed(3)})`;

  return (
    <div
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 惑星 */}
      <div className={styles.planetContainer} style={{ transform: `scale(${zoom})` }}>
        <div
          className={styles.atmosphere}
          style={{ boxShadow: `0 0 40px 14px ${glowOcean}, 0 0 80px 24px ${glowLand}` }}
        />
        <div className={styles.planet}>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className={styles.paintCanvas}
          />
        </div>
      </div>

      {/* 進捗パネル（上部） */}
      <div className={styles.progressPanel}>
        <div className={styles.progItem}>
          <span>🌊</span>
          <span className={styles.progPct}>{progress.ocean}%</span>
        </div>
        <div className={styles.progDivider} />
        <div className={styles.progItem}>
          <span>⛰️</span>
          <span className={styles.progPct}>{progress.land}%</span>
        </div>
        <div className={styles.progDivider} />
        <div className={styles.progItem}>
          <span className={styles.dot} />
          <span className={styles.progPctDim}>{progress.unexplored}%</span>
        </div>
      </div>

      {/* エネルギー選択バー（下部） */}
      <div className={styles.energyBar}>
        <button
          className={`${styles.energyBtn} ${activeEnergy === 'ocean' ? styles.activeOcean : ''}`}
          onPointerDown={e => { e.stopPropagation(); activeEnergyRef.current = 'ocean'; setActiveEnergy('ocean'); }}
        >
          <span className={styles.energyEmoji}>🌊</span>
          <span className={styles.energyLabel}>海</span>
        </button>
        <button
          className={`${styles.energyBtn} ${activeEnergy === 'land' ? styles.activeLand : ''}`}
          onPointerDown={e => { e.stopPropagation(); activeEnergyRef.current = 'land'; setActiveEnergy('land'); }}
        >
          <span className={styles.energyEmoji}>⛰️</span>
          <span className={styles.energyLabel}>大地</span>
        </button>
      </div>

      {/* ナラティブ（5秒後に自動フェード） */}
      {showNarrative && (
        <div className={styles.narrative}>
          <p>生命の種は見つかった。</p>
          <p>しかし、この星はまだ不毛な世界だ。</p>
          <p>海と大地を作り、生命の住める環境を完成させよう。</p>
        </div>
      )}

      {/* 隠しオブジェクト発見通知 */}
      {discoveryEvent && (
        <div className={styles.discoveryNotif} key={discoveryEvent.id}>
          <span className={styles.discoveryEmoji}>{discoveryEvent.emoji}</span>
          <span className={styles.discoveryName}>{discoveryEvent.name} を発見</span>
        </div>
      )}

      {/* 世界評価（クリア時） */}
      {worldEval && (
        <div className={styles.worldEval}>
          <div className={styles.evalEmoji}>{worldEval.emoji}</div>
          <div className={styles.evalName}>{worldEval.name}</div>
          <div className={styles.evalDesc}>{worldEval.desc}</div>
        </div>
      )}
    </div>
  );
}

export default Stage6Ocean;
