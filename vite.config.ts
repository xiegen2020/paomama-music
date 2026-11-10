import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,wasm}'],
        runtimeCaching: [
          {
            urlPattern: /^\/$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'paomama-shell',
              expiration: { maxEntries: 50 },
            },
          },
          {
            urlPattern: /\.wasm$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'paomama-wasm' },
          },
          {
            urlPattern: /\/(fonts|icons|sounds)\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'paomama-assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 3600 },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: '跑马吗 - 马拉松跑者音乐工作站',
        short_name: '跑马吗',
        description: '用对的节奏，跑更远的距离',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1a1a2e',
        background_color: '#0f0f1a',
        icons: [
          { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2020',
  },
});
