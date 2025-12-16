import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Allow dynamic base path for GitHub Pages (/ZXS-order-form/) vs Vercel (/).
const base = process.env.VITE_APP_BASE || '/'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        // Copy 404.html
        copyFileSync(
          join(__dirname, 'public', '404.html'),
          join(__dirname, 'dist', '404.html')
        )
        // Copy favicon to dist
        const imgDir = join(__dirname, 'dist', 'img')
        if (!existsSync(imgDir)) {
          mkdirSync(imgDir, { recursive: true })
        }
        copyFileSync(
          join(__dirname, 'src', 'img', 'ZXS website logo.png'),
          join(imgDir, 'ZXS website logo.png')
        )
        // Also copy from public if exists
        const publicImgDir = join(__dirname, 'public', 'img')
        if (existsSync(publicImgDir)) {
          const publicLogo = join(publicImgDir, 'ZXS website logo.png')
          if (existsSync(publicLogo)) {
            copyFileSync(publicLogo, join(imgDir, 'ZXS website logo.png'))
          }
        }
      }
    }
  ],
  base,
  server: {
    port: 3000,
    open: true
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})

