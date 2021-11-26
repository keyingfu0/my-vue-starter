import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import ElementPlus from 'unplugin-element-plus/vite'
import { resolve } from 'path'
// import styleImport, { AndDesignVueResolve } from 'vite-plugin-style-import'
import babel from '@rollup/plugin-babel'

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
      scss: { charset: false },
    },
  },
  plugins: [
    vue(),
    babel({
      babelHelpers: 'runtime',
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
      ],
      extensions: ['.ts', '.tsx', '.js', '.vue'],
      exclude: 'node_modules/**',
      plugins: [
        '@babel/plugin-transform-runtime',
        [
          'import',
          {
            libraryName: 'vxe-table',
            style: true, // 样式是否也按需加载
          },
          'vxe',
        ],
        [
          'import',
          {
            libraryName: 'ant-design-vue',
            libraryDirectory: 'es',
            style: 'css',
          },
          'antv',
        ],
        '@babel/plugin-proposal-optional-chaining',
        // '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    }),
    // ElementPlus(),
  ],
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
