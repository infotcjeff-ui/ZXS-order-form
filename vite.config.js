import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        copyFileSync(
          join(__dirname, 'public', '404.html'),
          join(__dirname, 'dist', '404.html')
        )
      }
    }
  ],
  base: '/ZXS-order-form/',
  server: {
    port: 3000,
    open: true
  },
  publicDir: 'public'
})

