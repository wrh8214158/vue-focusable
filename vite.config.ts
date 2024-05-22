import { defineConfig } from 'vite';
import { resolve } from 'path';
import { babel } from '@rollup/plugin-babel';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  // root: './',
  base: './',
  resolve: {
    // 设置别名
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    open: false,
    port: 5173,
    host: '127.0.0.1'
  },
  json: {
    // 是否支持从 .json 文件中进行按名导入
    namedExports: true,
    // 若设置为 true 导入的 json 会被转为 export default JSON.parse("..") 会比转译成对象字面量性能更好
    stringify: false
  },
  plugins: [dts({ rollupTypes: true, copyDtsFiles: true })],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'vue-focusable',
      fileName: 'index'
    },
    sourcemap: false, // 不生成 sourcemap
    minify: 'terser', // 启用 terser 压缩
    terserOptions: {
      compress: {
        pure_funcs: ['console.log'], // 只删除 console.log
        //drop_console: true, // 删除所有 console
        drop_debugger: true // 删除 debugger
      },
      format: {
        comments: false // 删除所有注释
      }
    },
    rollupOptions: {
      plugins: [
        babel({
          exclude: '**/node_modules/**',
          extensions: ['.js', '.ts'],
          babelHelpers: 'runtime',
          presets: [
            [
              '@babel/preset-env'
              // {
              //   useBuiltIns: 'usage',
              //   corejs: '3.27.1',
              //   targets: {
              //     browsers: [
              //       'last 10 versions',
              //       '> 0.01%',
              //       'ios 7',
              //       'Android 4.1',
              //       'ie >= 8',
              //       'chrome 17'
              //     ]
              //   }
              // }
            ]
          ],
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              {
                corejs: 3
              }
            ]
          ]
        })
      ]
    }
  }
});
