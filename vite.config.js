import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Vite 設定ファイル
 *
 * GitHub Pages への公開を想定して base を設定。
 * Capacitor 対応時は base を './' に変更するか、
 * 環境変数で切り替える（例: VITE_BASE=/）。
 */
export default defineConfig({
  // GitHub Pages のリポジトリ名に合わせる
  // Capacitor でビルドする際は './' に変更する
  base: '/tapocalypse/',

  plugins: [
    react(),

    // PWA プラグイン（manifest と service worker を自動生成）
    VitePWA({
      registerType: 'autoUpdate',

      // public/icons/ 以下の SVG を含める
      includeAssets: ['icons/*.svg'],

      // Web App Manifest
      manifest: {
        name: 'Tapocalypse',
        short_name: 'Tapocalypse',
        description: '世界を叩け！制限時間内にひたすらタップしてスコアを稼げ！',
        theme_color: '#0a0a1e',
        background_color: '#0a0a1e',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ja',
        start_url: '/tapocalypse/',
        scope: '/tapocalypse/',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },

      // Workbox（Service Worker）設定
      workbox: {
        // キャッシュ対象ファイル
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
});
