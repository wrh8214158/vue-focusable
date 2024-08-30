import { defineConfig } from 'vite';
import { resolve } from 'path';
import { babel } from '@rollup/plugin-babel';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [dts({ rollupTypes: true, copyDtsFiles: true })],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'vue-focusable',
      fileName: 'index'
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        pure_funcs: ['console.log'], // 只删除 console.log
        drop_debugger: true,
        pure_getters: true,
        unsafe: true,
        passes: 3 // 进行多次传递以进一步压缩代码
      },
      format: {
        comments: false // 删除所有注释
      }
    },
    rollupOptions: {
      output: {
        esModule: false
      },
      plugins: [
        babel({
          extensions: ['.ts', '.js'],
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: false,
                modules: false,
                targets: {
                  browsers: ['Android 4.2', 'Chrome >= 17']
                }
              }
            ]
          ]
        })
      ]
    }
  }
});
