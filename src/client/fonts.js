import { state } from './state'
import { showDropdown } from './dialogs'

const fontDefs = [
  { id: 'system', name: 'System Default', family: '', weight: 400, style: 'normal' },
  { id: 'maple-thin', name: 'Maple Mono CN Thin', family: 'Maple Mono CN', weight: 100, style: 'normal' },
  { id: 'maple-thin-italic', name: 'Maple Mono CN Thin Italic', family: 'Maple Mono CN', weight: 100, style: 'italic' },
  { id: 'maple-extralight', name: 'Maple Mono CN ExtraLight', family: 'Maple Mono CN', weight: 200, style: 'normal' },
  { id: 'maple-extralight-italic', name: 'Maple Mono CN ExtraLight Italic', family: 'Maple Mono CN', weight: 200, style: 'italic' },
  { id: 'maple-light', name: 'Maple Mono CN Light', family: 'Maple Mono CN', weight: 300, style: 'normal' },
  { id: 'maple-light-italic', name: 'Maple Mono CN Light Italic', family: 'Maple Mono CN', weight: 300, style: 'italic' },
  { id: 'maple-regular', name: 'Maple Mono CN', family: 'Maple Mono CN', weight: 400, style: 'normal' },
  { id: 'maple-italic', name: 'Maple Mono CN Italic', family: 'Maple Mono CN', weight: 400, style: 'italic' },
  { id: 'maple-medium', name: 'Maple Mono CN Medium', family: 'Maple Mono CN', weight: 500, style: 'normal' },
  { id: 'maple-medium-italic', name: 'Maple Mono CN Medium Italic', family: 'Maple Mono CN', weight: 500, style: 'italic' },
  { id: 'maple-semibold', name: 'Maple Mono CN SemiBold', family: 'Maple Mono CN', weight: 600, style: 'normal' },
  { id: 'maple-semibold-italic', name: 'Maple Mono CN SemiBold Italic', family: 'Maple Mono CN', weight: 600, style: 'italic' },
  { id: 'maple-bold', name: 'Maple Mono CN Bold', family: 'Maple Mono CN', weight: 700, style: 'normal' },
  { id: 'maple-bold-italic', name: 'Maple Mono CN Bold Italic', family: 'Maple Mono CN', weight: 700, style: 'italic' },
  { id: 'maple-extrabold', name: 'Maple Mono CN ExtraBold', family: 'Maple Mono CN', weight: 800, style: 'normal' },
  { id: 'maple-extrabold-italic', name: 'Maple Mono CN ExtraBold Italic', family: 'Maple Mono CN', weight: 800, style: 'italic' },
]

export function applyFont(id) {
  const def = fontDefs.find(f => f.id === id)
  if (!def) return
  state.currentFont = id
  localStorage.setItem('editor-font', id)
  const btn = document.getElementById('btn-font')
  if (btn) btn.textContent = def.id === 'system' ? 'Font' : def.name
  if (def.id === 'system') {
    document.body.classList.remove('font-maple')
    if (state.editor) state.editor.updateOptions({ fontFamily: undefined, fontWeight: undefined, fontStyle: undefined })
  } else {
    document.body.classList.add('font-maple')
    if (state.editor) state.editor.updateOptions({ fontFamily: def.family, fontWeight: String(def.weight), fontStyle: def.style === 'italic' ? 'italic' : 'normal' })
  }
}

export async function showFontPicker() {
  const items = fontDefs.map(d => ({ key: d.id, name: d.name }))
  const btn = document.getElementById('btn-font')
  if (!btn) return
  const key = await showDropdown(btn, items, {
    selectedKey: state.currentFont,
    renderItem: item => `<span class="theme-label">${escapeFont(item.name)}</span>`
  })
  if (key && key !== state.currentFont) applyFont(key)
}

function escapeFont(str) {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}
