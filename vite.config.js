import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import ElementPlus from 'unplugin-element-plus/vite'
import { resolve } from 'path'
import styleImport from 'vite-plugin-style-import'
import babel from '@rollup/plugin-babel'

export default defineConfig({
  plugins: [
    vue(),
    // ElementPlus(),
    styleImport({
      libs: [
        {
          libraryName: 'vxe-table',
          esModule: true,
          resolveComponent: (name) => `vxe-table/es/${name}`,
          resolveStyle: (name) => `vxe-table/es/${name}/style.css`,
        },
      ],
    }),
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
            libraryName: 'ant-design-vue',
            libraryDirectory: 'es',
            style: 'css',
          },
        ],
        '@babel/plugin-proposal-optional-chaining',
        // '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    }),
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
