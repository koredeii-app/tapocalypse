/**
 * Tapocalypse - Service Worker
 *
 * キャッシュ戦略: Cache First（静的アセットはキャッシュ優先、ネットワーク後退）
 * 将来的に動的コンテンツ（ランキングAPI等）を追加する場合は
 * Network First や Stale-While-Revalidate に切り替えること
 */

'use strict';

/** キャッシュ名（バージョンアップ時に変更してキャッシュを更新する） */
const CACHE_NAME = 'tapocalypse-v1.0.0';

/** キャッシュする静的アセットの一覧 */
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/game.js',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

/* ----------------------------------------
   インストール：アセットを事前キャッシュ
   ---------------------------------------- */
self.addEventListener('install', (event) => {
  console.log('[SW] インストール開始:', CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] アセットをキャッシュ中...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      console.log('[SW] キャッシュ完了');
      // 新しい SW を即座に有効化（waitingをスキップ）
      return self.skipWaiting();
    })
  );
});

/* ----------------------------------------
   アクティベート：古いキャッシュを削除
   ---------------------------------------- */
self.addEventListener('activate', (event) => {
  console.log('[SW] アクティベート:', CACHE_NAME);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] 古いキャッシュを削除:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // 開いている全タブを即座にコントロール下に置く
      return self.clients.claim();
    })
  );
});

/* ----------------------------------------
   フェッチ：Cache First 戦略
   ---------------------------------------- */
self.addEventListener('fetch', (event) => {
  // chrome-extension や非 http リクエストは無視
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // キャッシュヒット：即座に返す
        return cachedResponse;
      }

      // キャッシュミス：ネットワークから取得してキャッシュに追加
      return fetch(event.request).then((networkResponse) => {
        // レスポンスが有効な場合のみキャッシュに保存
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // ネットワーク不可かつキャッシュなし：オフラインフォールバック
        // 将来的にオフライン専用ページを返すことも可能
        console.warn('[SW] オフラインのためフェッチ失敗:', event.request.url);
      });
    })
  );
});
