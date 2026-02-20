import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('lf-')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      // 入口文件 - 创建一个入口文件而不是直接使用 .vue 文件
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'YysEditor',
      // 输出文件名
      fileName: (format) => `yys-editor.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 外部化依赖（不打包进库）
      external: [
        'vue',
        'element-plus',
        'pinia',
        '@logicflow/core',
        '@logicflow/extension',
        '@logicflow/vue-node-registry',
        '@element-plus/icons-vue',
        '@vueup/vue-quill',
        'vue3-draggable-resizable',
        'vuedraggable',
        'html2canvas',
        'vue-i18n'
      ],
      output: {
        // 全局变量名
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          pinia: 'Pinia',
          '@logicflow/core': 'LogicFlow',
          '@logicflow/extension': 'LogicFlowExtension',
          '@logicflow/vue-node-registry': 'LogicFlowVueNodeRegistry'
        },
        // 导出 CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'yys-editor.css'
          return assetInfo.name
        }
      }
    },
    // 生成 sourcemap
    sourcemap: true,
    // 清空输出目录
    emptyOutDir: false
  }
})
