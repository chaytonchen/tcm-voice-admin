import App from './App'
import store from './store'
import plugin from './js_sdk/uni-admin/plugin'
import messages from './i18n/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const lang = uni.getLocale()

import { createSSRApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
export function createApp() {
  const app = createSSRApp(App)
  const i18n = createI18n({
    locale: lang,
    messages
  })
  // 创建并使用Pinia
  const pinia = createPinia()

  app.use(i18n)
  app.use(plugin)
  app.use(store) // 保留原有的vuex store
  app.use(pinia) // 添加Pinia
  app.use(ElementPlus, {
    locale: zhCn
  })
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  return {
    app
  }
}
