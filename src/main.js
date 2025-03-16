import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import Vue3DraggableResizable from 'vue3-draggable-resizable'
// default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

import { createI18n } from 'vue-i18n'

// 引入语言文件
import zh from './locales/zh.json'
import ja from './locales/ja.json'

import { createPinia } from 'pinia' // 导入 Pinia

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 获取用户的首选语言
const userLanguage = navigator.language

// 定义支持的语言列表
const supportedLanguages = ['zh', 'ja']

// 根据用户的首选语言选择合适的语言
let locale = 'zh' // 默认语言为中文
if (supportedLanguages.includes(userLanguage.split('-')[0])) {
    locale = userLanguage.split('-')[0]
}

const i18n = createI18n({
    locale: locale, // 设置默认语言
    fallbackLocale: 'zh', // 设置备用语言
    messages: {
        zh,
        ja,
    },
})

const pinia = createPinia() // 创建 Pinia 实例

app.use(pinia) // 使用 Pinia
    .use(i18n)
    .use(ElementPlus)
    .use(Vue3DraggableResizable)
    .mount('#app')