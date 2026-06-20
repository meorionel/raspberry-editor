import { state } from './state'
import { showDropdown } from './dialogs'

const themeDefs = [
  { id: 'rose-pine',           name: 'Rosé Pine',      file: 'rose-pine-color-theme.json' },
  { id: 'rose-pine-moon',     name: 'Rosé Pine Moon',  file: 'rose-pine-moon-color-theme.json' },
  { id: 'rose-pine-dawn',     name: 'Rosé Pine Dawn',  file: 'rose-pine-dawn-color-theme.json' },
  { id: 'rose-pine-no-italics', name: 'Rosé Pine (No Italics)', file: 'rose-pine-no-italics-color-theme.json' },
  { id: 'rose-pine-moon-no-italics', name: 'Rosé Pine Moon (No Italics)', file: 'rose-pine-moon-no-italics-color-theme.json' },
  { id: 'rose-pine-dawn-no-italics', name: 'Rosé Pine Dawn (No Italics)', file: 'rose-pine-dawn-no-italics-color-theme.json' },
]

function extractCSSVars(colors, type) {
  const isDark = type === 'dark'
  return {
    '--bg':                colors['editor.background'] || (isDark ? '#1e1e1e' : '#ffffff'),
    '--surface':           colors['activityBar.background'] || colors['sideBar.background'] || (isDark ? '#252526' : '#f3f3f3'),
    '--surface-hover':     colors['list.hoverBackground'] || (isDark ? '#2a2d2e' : '#e8e8e8'),
    '--border':            colors['tab.border'] || (isDark ? '#3c3c3c' : '#d4d4d4'),
    '--text':              colors['editor.foreground'] || (isDark ? '#cccccc' : '#1e1e1e'),
    '--text-dim':          colors['tab.inactiveForeground'] || colors['descriptionForeground'] || (isDark ? '#6e6e6e' : '#888888'),
    '--accent':            colors['statusBar.background'] || colors['button.background'] || '#0078d4',
    '--tab-active-bg':     colors['tab.activeBackground'] || colors['editor.background'] || (isDark ? '#1e1e1e' : '#ffffff'),
    '--tab-inactive-bg':   colors['tab.inactiveBackground'] || (isDark ? '#2d2d2d' : '#ececec'),
    '--tab-close-hover':   isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    '--overlay':           isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
  }
}

function applyCSSVars(vars) {
  const root = document.documentElement
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val)
  }
}

function defineMonacoTheme(id, data) {
  const base = data.type === 'dark' ? 'vs-dark' : 'vs'
  const rules = []
  for (const tc of data.tokenColors || []) {
    const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope]
    for (const scope of scopes) {
      if (!scope) continue
      const rule = { token: scope }
      if (tc.settings) {
        if (tc.settings.foreground) rule.foreground = tc.settings.foreground
        if (tc.settings.background) rule.background = tc.settings.background
        if (tc.settings.fontStyle) rule.fontStyle = tc.settings.fontStyle
      }
      rules.push(rule)
    }
  }
  const colors = {}
  for (const [key, val] of Object.entries(data.colors)) {
    if (val && val.startsWith('#')) colors[key] = val
  }
  monaco.editor.defineTheme(id, { base, inherit: false, rules, colors })
}

async function loadTheme(id) {
  if (state.loadedThemes[id]) return state.loadedThemes[id]
  const def = themeDefs.find(t => t.id === id)
  if (!def) throw new Error('Unknown theme: ' + id)
  const res = await fetch('/themes/' + def.file)
  if (!res.ok) throw new Error('Failed to load theme: ' + def.file)
  const data = await res.json()
  state.loadedThemes[id] = data
  return data
}

export async function applyTheme(id) {
  const data = await loadTheme(id)
  const vars = extractCSSVars(data.colors, data.type)
  applyCSSVars(vars)
  defineMonacoTheme(id, data)
  monaco.editor.setTheme(id)
  state.currentTheme = id
  localStorage.setItem('editor-theme', id)
  const btn = document.getElementById('btn-theme')
  if (btn) btn.textContent = 'Theme: ' + data.name
}

export async function showThemePicker() {
  const items = themeDefs.map(d => ({
    key: d.id,
    name: (state.loadedThemes[d.id] || {}).name || d.name,
    type: (state.loadedThemes[d.id] || {}).type || '',
  }))
  for (const item of items) {
    if (!state.loadedThemes[item.key]) continue
    const data = state.loadedThemes[item.key]
    item.bg = data.colors['editor.background'] || (data.type === 'dark' ? '#1e1e1e' : '#fff')
  }
  const btn = document.getElementById('btn-theme')
  if (!btn) return
  const key = await showDropdown(btn, items, {
    selectedKey: state.currentTheme,
    renderItem: item => `<span class="theme-label">${escapeThem(item.name)}</span>`
  })
  if (key && key !== state.currentTheme) {
    await applyTheme(key)
  }
}

function escapeThem(str) {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}
