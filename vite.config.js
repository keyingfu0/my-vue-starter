import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import ElementPlus from 'unplugin-element-plus/vite'
import { resolve } from 'path'
import styleImport from 'vite-plugin-style-import'
import babel from '@rollup/plugin-babel'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

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
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    babel({
      babelHelpers: 'runtime',
      // presets: [
      //   [
      //     '@babel/preset-env',
      //     {
      //       modules: false,
      //     },
      //   ],
      // ],
      extensions: ['.ts', '.tsx', '.js'],
      exclude: 'node_modules/**',
      plugins: [
        '@babel/plugin-transform-runtime',
        [
          'import',
          {
            libraryName: 'lodash',
            libraryDirectory: '',
            camel2DashComponentName: false,
          },
          'lodash',
        ],
        // [
        //   'import',
        //   {
        //     libraryName: 'vxe-table',
        //     style: true, // 样式是否也按需加载
        //   },
        //   'vxe',
        // ],
        // [
        //   'import',
        //   {
        //     libraryName: 'ant-design-vue',
        //     libraryDirectory: 'es',
        //     style: 'css',
        //   },
        //   'antv',
        // ],
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    }),
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
    nodeResolve({
      mainFields: ['jsnext:main'],
    }),
    commonjs({
      include: 'node_modules/**',
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
