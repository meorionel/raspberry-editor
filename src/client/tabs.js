import { state } from './state'
import { showConfirm } from './dialogs'
import { updateStatusLang, updateEditorStats } from './api'
import { renderFileTree, refreshFileTree } from './filetree'
import { newFileInline } from './filetree'

export function showWelcome(show) {
  const el = document.getElementById('welcome')
  if (el) el.classList.toggle('hidden', !show)
  const ec = document.getElementById('editor-container')
  if (ec) ec.style.display = show ? 'none' : 'block'
}

export function renderTabs() {
  const bar = document.getElementById('tabbar')
  if (!bar) return
  const keys = [...state.models.keys()]
  bar.innerHTML = ''
  for (const key of keys) {
    const tab = document.createElement('div')
    tab.className = 'tab' + (key === state.activeKey ? ' active' : '') + (state.dirtyKeys.has(key) ? ' dirty' : '')
    const name = document.createElement('span')
    name.textContent = key
    tab.appendChild(name)
    const indicator = document.createElement('div')
    indicator.className = 'tab-indicator'
    const dirty = document.createElement('span')
    dirty.className = 'tab-dirty'
    dirty.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a5 5 0 1 1 0-10a5 5 0 0 1 0 10Z"/></svg>'
    indicator.appendChild(dirty)
    const close = document.createElement('span')
    close.className = 'tab-close'
    close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>'
    close.onclick = (e) => { e.stopPropagation(); closeTab(key) }
    indicator.appendChild(close)
    tab.appendChild(indicator)
    tab.onclick = () => switchTab(key)
    bar.appendChild(tab)
  }
  const addBtn = document.createElement('div')
  addBtn.className = 'tab-add'
  addBtn.textContent = '+'
  addBtn.onclick = () => newFileInline()
  addBtn.title = 'New File'
  bar.appendChild(addBtn)
}

export function switchTab(key) {
  if (state.activeKey === key) return
  const model = state.models.get(key)
  if (!model || !state.editor) return
  state.editor.setModel(model)
  state.activeKey = key
  updateStatusLang(key)
  updateEditorStats()
  renderTabs()
  renderFileTree()
}

export async function closeTab(key) {
  const model = state.models.get(key)
  if (!model) return
  if (state.dirtyKeys.has(key)) {
    if (!await showConfirm(`"${key}" has unsaved changes. Close anyway?`)) return
  }
  model.dispose()
  state.models.delete(key)
  state.dirtyKeys.delete(key)
  if (state.models.size === 0) {
    state.activeKey = null
    showWelcome(true)
    document.title = 'Editor'
    renderTabs()
    renderFileTree()
    return
  }
  if (key === state.activeKey) {
    const remaining = [...state.models.keys()]
    switchTab(remaining[0])
  } else {
    renderTabs()
    renderFileTree()
  }
}

export async function saveFile() {
  if (!state.activeKey || !state.models.has(state.activeKey) || !state.editor) return
  const content = state.editor.getValue()
  try {
    const { api } = await import('./api.js')
    await api('/' + encodeURIComponent(state.activeKey), {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    state.dirtyKeys.delete(state.activeKey)
    renderTabs()
    refreshFileTree()
    const { updateStatus } = await import('./api.js')
    updateStatus(state.activeKey + ' saved')
    updateEditorStats()
  } catch (e) {
    showConfirm('Save failed: ' + e.message)
  }
}
