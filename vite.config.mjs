import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 3000,
      cors: true,
      proxy: {
        // Proxy API requests to avoid CORS issues
        '/api': {
          target: 'https://api.thienhang.com',
          changeOrigin: true,
          secure: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(
                '🔄 Proxying request:',
                req.method,
                req.url,
                '-> https://api.thienhang.com' + req.url.replace('/api', ''),
              )

              // Completely clear all headers and rebuild clean ones
              Object.keys(proxyReq.getHeaders()).forEach((header) => {
                proxyReq.removeHeader(header)
              })

              // Set headers to match legitimate domain for whitelist
              proxyReq.setHeader('Accept', 'application/json')
              proxyReq.setHeader('Content-Type', 'application/json')
              proxyReq.setHeader('Origin', 'https://thienhang.com')
              proxyReq.setHeader('Referer', 'https://thienhang.com/')
              proxyReq.setHeader('Host', 'api.thienhang.com')
              proxyReq.setHeader(
                'User-Agent',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              )

              // Add auth if present
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization)
              }

              console.log('📋 Final headers:', Object.keys(proxyReq.getHeaders()))
            })

            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ Proxy response:', proxyRes.statusCode, req.url)

              // Keep cookies as-is to maintain security (HttpOnly + Secure)
              // Service manages session server-side, cookies should remain untouchable
              if (proxyRes.headers['set-cookie']) {
                console.log(
                  '🍪 Preserving secure cookies (HttpOnly + Secure):',
                  proxyRes.headers['set-cookie'].length,
                )
              }
            })
          },
        },
      },
    },
  }
})
