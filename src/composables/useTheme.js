import { ref, watch } from 'vue'

const STORAGE_KEY = 'app-theme'
const THEMES = ['light', 'dark', 'sepia']
const theme = ref(localStorage.getItem(STORAGE_KEY) || 'light')

function applyTheme(name) {
  const root = document.documentElement
  root.classList.remove('theme-light', 'theme-dark', 'theme-sepia')
  root.classList.add(`theme-${name}`)
  
  // 同步 Element Plus 暗色模式
  if (name === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  
  theme.value = name
  localStorage.setItem(STORAGE_KEY, name)
  
  // 触发自定义事件，通知当前标签页的其他组件
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: name } }))
}

function cycleTheme() {
  const idx = THEMES.indexOf(theme.value)
  const next = THEMES[(idx + 1) % THEMES.length]
  applyTheme(next)
}

// 启动时立即应用
applyTheme(theme.value)

export function useTheme() {
  return {
    theme,
    THEMES,
    applyTheme,
    cycleTheme,
  }
}
