import { state } from './state'
import { applyTheme } from './themes'
import { applyFont } from './fonts'
import { showThemePicker } from './themes'
import { showFontPicker } from './fonts'
import { showLanguagePicker } from './api'
import { renderTabs, showWelcome, saveFile, closeTab } from './tabs'
import { renderFileTree, refreshFileTree, newFileInline, newDirInline } from './filetree'
import { loadIconTheme } from './icons'

window.monacoReady.then(() => {
  state.editor = monaco.editor.create(document.getElementById('editor-container'), {
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    tabSize: 2,
    wordWrap: 'on',
  })

  state.editor.onDidChangeModelContent(() => {
    if (state.activeKey && !state.dirtyKeys.has(state.activeKey)) {
      state.dirtyKeys.add(state.activeKey)
      renderTabs()
      renderFileTree()
    }
  })

  const langEl = document.getElementById('status-lang')
  if (langEl) langEl.onclick = showLanguagePicker

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveFile() }
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (state.activeKey) closeTab(state.activeKey) }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); newFileInline() }
  })

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault()
  })

  const btnTheme = document.getElementById('btn-theme')
  const btnFont = document.getElementById('btn-font')
  if (btnTheme) btnTheme.onclick = showThemePicker
  if (btnFont) btnFont.onclick = showFontPicker

  const btnNewFile = document.querySelector('.sidebar-btn[title="New File"]')
  const btnNewDir = document.querySelector('.sidebar-btn[title="New Directory"]')
  const btnRefresh = document.querySelector('.sidebar-btn[title="Refresh file list"]')
  if (btnNewFile) btnNewFile.onclick = () => newFileInline()
  if (btnNewDir) btnNewDir.onclick = () => newDirInline()
  if (btnRefresh) btnRefresh.onclick = refreshFileTree

  applyFont(state.currentFont)
  applyTheme(state.currentTheme)
  document.getElementById('loading-screen').classList.add('hidden')
  showWelcome(true)
  refreshFileTree()
  loadIconTheme()
})
