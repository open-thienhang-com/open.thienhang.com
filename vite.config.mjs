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
          onProxyReq: (proxyReq, req, res) => {
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

            // Set only essential headers like direct curl
            proxyReq.setHeader('Accept', 'application/json')
            proxyReq.setHeader('Content-Type', 'application/json')
            proxyReq.setHeader('User-Agent', 'curl/8.7.1')

            // Add auth if present
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization)
            }

            console.log('📋 Final headers:', Object.keys(proxyReq.getHeaders()))
          },
          onProxyRes: (proxyRes, req, res) => {
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url)

            // Handle cookies for development
            if (proxyRes.headers['set-cookie']) {
              const cookies = proxyRes.headers['set-cookie'].map((cookie) =>
                cookie.replace(/; HttpOnly/gi, '').replace(/; Secure/gi, ''),
              )
              res.setHeader('Set-Cookie', cookies)
            }
          },
        },
      },
    },
  }
})
