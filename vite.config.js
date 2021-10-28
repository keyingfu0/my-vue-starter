import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ElementPlus from 'unplugin-element-plus/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), ElementPlus()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: false,
    port: 3001,
  },
})
