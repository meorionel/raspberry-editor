import { state } from './state'
import { api, langFromKey, updateStatusLang } from './api'
import { showAlert, showConfirm } from './dialogs'
import { iconPath } from './icons'
import { showWelcome } from './tabs'

export { showWelcome } from './tabs'

export function selectedTreeDir() {
  if (!state.selectedTreePath || !state.fileTreeFiles) return null
  const entry = state.fileTreeFiles.find(f => f.key === state.selectedTreePath + '/')
  if (entry) return state.selectedTreePath
  if (state.selectedTreePath.includes('/')) return state.selectedTreePath.split('/').slice(0, -1).join('/')
  return null
}

function buildTree(files) {
  const root = {}
  for (const f of files) {
    const parts = f.key.split('/').filter(Boolean)
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1 && !f.key.endsWith('/')) {
        node[part] = { type: 'file', key: f.key, size: f.size, name: part }
      } else {
        if (!node[part]) node[part] = { type: 'folder', name: part, children: {} }
        node = node[part].children
      }
    }
  }
  return root
}

function treeSortEntries(entries) {
  return entries.sort((a, b) => {
    const aIsFolder = a[1].type === 'folder'
    const bIsFolder = b[1].type === 'folder'
    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1
    return a[0].localeCompare(b[0])
  })
}

function escapeHtml(str) {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function renderTreeHTML(nodes, basePath) {
  let html = '<ul class="tree">'
  const entries = treeSortEntries(Object.entries(nodes))
  for (const [name, node] of entries) {
    const path = basePath ? basePath + '/' + name : name
    if (node.type === 'folder') {
      const expanded = state.treeExpanded[path] || false
      const isSelected = path === state.selectedTreePath
      html += '<li class="tree-folder' + (expanded ? ' expanded' : '') + '">'
      html += '<span class="tree-folder-label' + (isSelected ? ' selected' : '') + '" data-path="' + escapeHtml(path) + '">'
      html += '<span class="tree-chevron"><svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6"/></svg></span>'
      html += '<img class="tree-icon" src="' + iconPath(path, true, name) + '" />'
      html += escapeHtml(name) + '</span>'
      html += '<ul class="tree-children">'
      if (expanded) {
        html += renderTreeHTML(node.children, path)
      }
      html += '</ul>'
      html += '</li>'
    } else {
      const isDirty = state.dirtyKeys.has(node.key) ? ' dirty' : ''
      const isActive = node.key === state.activeKey ? ' active' : ''
      const isSelected = node.key === state.selectedTreePath ? ' selected' : ''
      html += '<li class="tree-file' + isDirty + isActive + isSelected + '" data-key="' + escapeHtml(node.key) + '">'
      html += '<span class="tree-chevron-placeholder"></span>'
      html += '<img class="tree-icon" src="' + iconPath(node.key, false) + '" />'
      html += escapeHtml(node.name)
      if (isDirty) {
        html += '<span class="tree-dirty"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a5 5 0 1 1 0-10a5 5 0 0 1 0 10Z"/></svg></span>'
      }
      html += '</li>'
    }
  }
  html += '</ul>'
  return html
}

let rendering = false

export function renderFileTree() {
  if (rendering) return
  rendering = true
  const container = document.getElementById('file-tree')
  if (!container) { rendering = false; return }

  const createInput = (handler) => {
    const li = document.createElement('li')
    li.className = 'tree-new-file'
    const placeholder = document.createElement('span')
    placeholder.className = 'tree-chevron-placeholder'
    li.appendChild(placeholder)
    const icon = document.createElement('img')
    icon.className = 'tree-icon'
    icon.src = state.pendingNewDir ? '/icons/folder_dark.svg' : '/icons/text_dark.svg'
    li.appendChild(icon)
    const input = document.createElement('input')
    input.className = 'tree-input'
    input.placeholder = state.pendingNewFile ? 'Filename...' : 'Directory name...'
    li.appendChild(input)
    handler(input)
    return li
  }

  if (!state.fileTreeFiles || !state.fileTreeFiles.length) {
    container.innerHTML = '<div class="tree-empty">' + (state.fileTreeFiles ? 'No files' : 'Loading...') + '</div>'
    if (state.pendingNewFile || state.pendingNewDir) {
      container.innerHTML = ''
      const ul = document.createElement('ul')
      ul.className = 'tree'
      ul.appendChild(createInput(state.pendingNewFile ? setupNewFileInput : setupNewDirInput))
      container.appendChild(ul)
    }
    rendering = false
    return
  }

  const filteredFiles = state.fileTreeFiles.filter(f => !f.key.split('/').pop().startsWith('occupy_space_'))
  const tree = buildTree(filteredFiles)
  container.innerHTML = renderTreeHTML(tree, '')

  container.querySelectorAll('.tree-folder-label').forEach(el => {
    el.onclick = function (e) {
      e.stopPropagation()
      const path = this.dataset.path
      state.treeExpanded[path] = !state.treeExpanded[path]
      state.selectedTreePath = path
      renderFileTree()
    }
    el.oncontextmenu = function (e) {
      import('./context.js').then(({ showContextMenu }) => showContextMenu(e, this.dataset.path, true))
    }
  })

  container.onclick = function (e) {
    if (!e.target.closest('.tree-file') && !e.target.closest('.tree-folder-label') && !e.target.closest('.tree-new-file')) {
      state.selectedTreePath = null
      renderFileTree()
    }
  }

  container.oncontextmenu = (e) => {
    if (e.target.closest('.tree-file') || e.target.closest('.tree-folder-label')) return
    import('./context.js').then(({ showContextMenu }) => showContextMenu(e, '', true))
  }

  container.querySelectorAll('.tree-file').forEach(el => {
    el.onclick = function () {
      state.selectedTreePath = this.dataset.key
      openFileByKey(this.dataset.key)
    }
    el.oncontextmenu = function (e) {
      import('./context.js').then(({ showContextMenu }) => showContextMenu(e, this.dataset.key, false))
    }
  })

  if (state.pendingNewFile || state.pendingNewDir) {
    const input = createInput(state.pendingNewFile ? setupNewFileInput : setupNewDirInput)
    if (state.pendingBasePath) {
      const label = container.querySelector(`.tree-folder-label[data-path="${CSS.escape(state.pendingBasePath)}"]`)
      if (label) {
        const children = label.parentElement.querySelector('.tree-children')
        if (children) {
          const ref = children.firstChild
          if (ref && ref.parentNode === children) {
            children.insertBefore(input, ref)
          } else {
            children.appendChild(input)
          }
        }
      }
    } else {
      const treeEl = container.querySelector('.tree')
      if (treeEl) {
        if (state.pendingNewFile) {
          const firstFile = treeEl.querySelector('.tree-file')
          if (firstFile && firstFile.parentNode === treeEl) {
            treeEl.insertBefore(input, firstFile)
          } else {
            treeEl.appendChild(input)
          }
        } else {
          const ref = treeEl.firstChild
          if (ref && ref.parentNode === treeEl) {
            treeEl.insertBefore(input, ref)
          } else {
            treeEl.appendChild(input)
          }
        }
      }
    }
  }

  if (state.renameTarget) {
    handleRenameInput(container)
  }
  rendering = false
}

function handleRenameInput(container) {
  const isFolder = state.renameTarget.endsWith('/')
  const fileEl = container.querySelector(`.tree-file[data-key="${CSS.escape(state.renameTarget)}"]`)
  const folderEl = isFolder ? container.querySelector(`.tree-folder-label[data-path="${CSS.escape(state.renameTarget.replace(/\/$/, ''))}"]`) : null
  const el = fileEl || folderEl
  if (!el) return

  const oldName = state.renameTarget.split('/').filter(Boolean).pop()
  const oldKey = state.renameTarget

  if (fileEl) {
    fileEl.innerHTML = ''
    fileEl.style.display = 'flex'
    fileEl.style.alignItems = 'center'
    fileEl.style.gap = '2px'
    fileEl.style.cursor = 'default'
    const placeholder = document.createElement('span')
    placeholder.className = 'tree-chevron-placeholder'
    fileEl.appendChild(placeholder)
    const icon = document.createElement('img')
    icon.className = 'tree-icon'
    icon.src = iconPath(state.renameTarget, false)
    fileEl.appendChild(icon)
  }

  const input = document.createElement('input')
  input.className = 'tree-input'
  input.value = oldName
  el.appendChild(input)
  input.focus()
  input.select()

  async function finishRename() {
    const newName = input.value.trim()
    if (!newName || newName === oldName) { state.renameTarget = null; renderFileTree(); return }
    if (newName.startsWith('occupy_space_')) {
      await showAlert('Name cannot start with "occupy_space_"')
      state.renameTarget = null
      renderFileTree()
      return
    }

    if (isFolder) {
      const dirKey = oldKey
      const newDirKey = dirKey.replace(/\/?$/, '/').replace(/[^/]+\/$/, newName + '/')
      if (state.fileTreeFiles && state.fileTreeFiles.some(f => f.key === newDirKey || f.key.startsWith(newDirKey))) {
        await showAlert('A file or directory with that name already exists')
        state.renameTarget = null
        renderFileTree()
        return
      }
      try {
        await api('/rename', { method: 'POST', body: JSON.stringify({ oldKey: dirKey, newKey: newDirKey }) })
      } catch (e) {
        await showAlert('Rename failed: ' + e.message)
        state.renameTarget = null
        renderFileTree()
        return
      }
      for (const f of state.fileTreeFiles) {
        if (f.key === dirKey || f.key.startsWith(dirKey)) {
          f.key = f.key.replace(dirKey, newDirKey)
        }
      }
      for (const [k, model] of state.models) {
        if (k === dirKey.replace(/\/$/, '') || k.startsWith(dirKey.replace(/\/$/, ''))) {
          const newK = k.replace(dirKey.replace(/\/$/, ''), newDirKey.replace(/\/$/, ''))
          state.models.delete(k)
          state.models.set(newK, model)
          if (state.dirtyKeys.has(k)) { state.dirtyKeys.delete(k); state.dirtyKeys.add(newK) }
          if (state.activeKey === k) { state.activeKey = newK; updateStatusLang(newK) }
        }
      }
    } else {
      const parts = oldKey.split('/')
      parts[parts.length - 1] = newName
      const newKey = parts.join('/')
      if (state.fileTreeFiles && state.fileTreeFiles.some(f => f.key === newKey)) {
        await showAlert('A file with that name already exists')
        state.renameTarget = null
        renderFileTree()
        return
      }
      try {
        await api('/rename', { method: 'POST', body: JSON.stringify({ oldKey, newKey }) })
      } catch (e) {
        await showAlert('Rename failed: ' + e.message)
        state.renameTarget = null
        renderFileTree()
        return
      }
      if (state.models.has(oldKey)) {
        const model = state.models.get(oldKey)
        state.models.delete(oldKey)
        state.models.set(newKey, model)
        if (state.dirtyKeys.has(oldKey)) { state.dirtyKeys.delete(oldKey); state.dirtyKeys.add(newKey) }
        if (state.activeKey === oldKey) { state.activeKey = newKey; updateStatusLang(newKey) }
      }
      const entry = state.fileTreeFiles.find(f => f.key === oldKey)
      if (entry) entry.key = newKey
    }
    state.renameTarget = null
    state.fileTreeFiles.sort(typeSort)
    import('./tabs.js').then(({ renderTabs }) => renderTabs())
    renderFileTree()
    if (state.editor) state.editor.focus()
  }

  input.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); finishRename() }
    else if (e.key === 'Escape') { e.preventDefault(); state.renameTarget = null; renderFileTree() }
  }
  input.onblur = () => { if (state.renameTarget) { state.renameTarget = null; renderFileTree() } }
}

function typeSort(a, b) {
  const aDir = a.key.endsWith('/')
  const bDir = b.key.endsWith('/')
  if (aDir !== bDir) return aDir ? -1 : 1
  return a.key.localeCompare(b.key)
}

export function startRename(key) {
  const isDir = state.fileTreeFiles && state.fileTreeFiles.some(f => f.key === key + '/')
  state.renameTarget = isDir ? key + '/' : key
  renderFileTree()
}

export async function openFileByKey(key) {
  if (state.models.has(key)) {
    import('./tabs.js').then(({ switchTab }) => switchTab(key))
    return
  }
  try {
    const data = await api('/' + encodeURIComponent(key))
    const lang = langFromKey(key)
    const model = monaco.editor.createModel(data.content, lang)
    state.models.set(key, model)
    state.editor.setModel(model)
    state.activeKey = key
    showWelcome(false)
    updateStatusLang(key)
    import('./tabs.js').then(({ renderTabs }) => renderTabs())
    renderFileTree()
    state.editor.focus()
  } catch (e) {
    showAlert('Failed to load file: ' + e.message)
  }
}

export async function refreshFileTree() {
  try {
    state.fileTreeFiles = await api('')
    renderFileTree()
  } catch (e) {
    showAlert('Failed to load files: ' + e.message)
  }
}

export function newFileInline(basePath) {
  if (state.pendingNewFile || state.pendingNewDir) return
  if (!state.fileTreeFiles) {
    api('').then(files => {
      state.fileTreeFiles = files
      newFileInline(basePath)
    }).catch(e => showAlert('Failed to load file list: ' + e.message))
    return
  }
  state.pendingBasePath = basePath != null ? basePath : (selectedTreeDir() || '')
  if (state.pendingBasePath) state.treeExpanded[state.pendingBasePath] = true
  state.pendingNewFile = true
  renderFileTree()
}

export function newDirInline(basePath) {
  if (state.pendingNewFile || state.pendingNewDir) return
  if (!state.fileTreeFiles) {
    api('').then(files => {
      state.fileTreeFiles = files
      newDirInline(basePath)
    }).catch(e => showAlert('Failed to load file list: ' + e.message))
    return
  }
  state.pendingBasePath = basePath != null ? basePath : (selectedTreeDir() || '')
  if (state.pendingBasePath) state.treeExpanded[state.pendingBasePath] = true
  state.pendingNewDir = true
  renderFileTree()
}

function setupNewFileInput(input) {
  requestAnimationFrame(() => {
    input.focus()
    input.select()
    input.scrollIntoView({ block: 'nearest' })
  })

  async function commitNewFile() {
    if (!state.pendingNewFile) return
    const name = input.value.trim()
    const basePath = state.pendingBasePath
    state.pendingNewFile = false
    state.pendingBasePath = ''
    if (!name) { renderFileTree(); return }
    if (name.startsWith('occupy_space_')) {
      await showAlert('File name cannot start with "occupy_space_"')
      renderFileTree()
      return
    }
    const fullKey = basePath ? basePath + '/' + name : name
    if (state.fileTreeFiles && state.fileTreeFiles.some(f => f.key === fullKey)) {
      if (state.models.has(fullKey)) {
        import('./tabs.js').then(({ switchTab }) => switchTab(fullKey))
        return
      }
      await showAlert('A file with that name already exists')
      renderFileTree()
      return
    }
    if (state.models.has(fullKey)) {
      import('./tabs.js').then(({ switchTab }) => switchTab(fullKey))
      renderFileTree()
      return
    }
    const lang = langFromKey(fullKey)
    const model = monaco.editor.createModel('', lang)
    state.models.set(fullKey, model)
    state.dirtyKeys.add(fullKey)
    state.fileTreeFiles.push({ key: fullKey, size: 0, uploaded: '' })
    state.fileTreeFiles.sort(typeSort)
    state.editor.setModel(model)
    state.activeKey = fullKey
    showWelcome(false)
    updateStatusLang(fullKey)
    import('./tabs.js').then(({ renderTabs }) => renderTabs())
    state.editor.focus()
    try {
      await api('/' + encodeURIComponent(fullKey), {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
      })
      state.dirtyKeys.delete(fullKey)
      import('./tabs.js').then(({ renderTabs }) => renderTabs())
      renderFileTree()
    } catch (err) {
      model.dispose()
      state.models.delete(fullKey)
      state.fileTreeFiles = state.fileTreeFiles.filter(f => f.key !== fullKey)
      if (state.activeKey === fullKey) state.activeKey = null
      await showAlert('Failed to create file: ' + err.message)
      renderFileTree()
      import('./tabs.js').then(({ renderTabs }) => renderTabs())
    }
  }

  input.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitNewFile() }
    else if (e.key === 'Escape') {
      e.preventDefault()
      if (!state.pendingNewFile) return
      state.pendingNewFile = false
      state.pendingBasePath = ''
      renderFileTree()
    }
  }
  input.onblur = () => { commitNewFile() }
}

function setupNewDirInput(input) {
  requestAnimationFrame(() => {
    input.focus()
    input.select()
    input.scrollIntoView({ block: 'nearest' })
  })

  async function commitNewDir() {
    if (!state.pendingNewDir) return
    const name = input.value.trim()
    const basePath = state.pendingBasePath
    state.pendingNewDir = false
    state.pendingBasePath = ''
    if (!name) { renderFileTree(); return }
    if (name.startsWith('occupy_space_')) {
      await showAlert('Directory name cannot start with "occupy_space_"')
      renderFileTree()
      return
    }
    const fullKey = basePath ? basePath + '/' + name : name
    const dirKey = fullKey.endsWith('/') ? fullKey : fullKey + '/'
    if (state.fileTreeFiles && state.fileTreeFiles.some(f => f.key.startsWith(dirKey))) {
      await showAlert('A directory with that name already exists')
      renderFileTree()
      return
    }
    const rand = Math.random().toString(36).slice(2, 8)
    try {
      await api('/' + encodeURIComponent(dirKey), { method: 'POST', body: JSON.stringify({ content: '' }) })
      await api('/' + encodeURIComponent(dirKey + 'occupy_space_' + rand), { method: 'POST', body: JSON.stringify({ content: '' }) })
    } catch (e) {
      await showAlert('Failed to create directory: ' + e.message)
      renderFileTree()
      return
    }
    await refreshFileTree()
  }

  input.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitNewDir() }
    else if (e.key === 'Escape') {
      e.preventDefault()
      if (!state.pendingNewDir) return
      state.pendingNewDir = false
      state.pendingBasePath = ''
      renderFileTree()
    }
  }
  input.onblur = () => { commitNewDir() }
}

export async function deleteFile(key) {
  const isDir = key.endsWith('/') || (state.fileTreeFiles && state.fileTreeFiles.some(f => f.key === key + '/'))
  const normalizedKey = isDir ? (key.endsWith('/') ? key : key + '/') : key
  const name = isDir ? normalizedKey.split('/').filter(Boolean).pop() : key.split('/').pop()
  if (!await showConfirm(`Delete "${name}"?`)) return

  if (isDir) {
    const prefix = normalizedKey
    const affectedKeys = state.fileTreeFiles.filter(f => f.key.startsWith(prefix)).map(f => f.key)
    for (const fk of affectedKeys) {
      if (state.models.has(fk)) {
        state.models.get(fk).dispose()
        state.models.delete(fk)
        state.dirtyKeys.delete(fk)
      }
    }
    state.fileTreeFiles = state.fileTreeFiles.filter(f => !f.key.startsWith(prefix))
    try { await api('/' + encodeURIComponent(prefix) + '?recursive=true', { method: 'DELETE' }) } catch (e) {}
    if (!state.activeKey || affectedKeys.includes(state.activeKey) || affectedKeys.some(k => k === state.activeKey + '/')) {
      const remaining = [...state.models.keys()]
      if (remaining.length) import('./tabs.js').then(({ switchTab }) => switchTab(remaining[0]))
      else { state.activeKey = null; showWelcome(true); document.title = 'Editor' }
    }
  } else {
    if (state.models.has(key)) {
      state.models.get(key).dispose()
      state.models.delete(key)
      state.dirtyKeys.delete(key)
      if (key === state.activeKey) {
        const remaining = [...state.models.keys()]
        if (remaining.length) import('./tabs.js').then(({ switchTab }) => switchTab(remaining[0]))
        else { state.activeKey = null; showWelcome(true); document.title = 'Editor' }
      }
    }
    state.fileTreeFiles = state.fileTreeFiles.filter(f => f.key !== key)
    try { await api('/' + encodeURIComponent(key), { method: 'DELETE' }) } catch (e) {}
  }
  import('./tabs.js').then(({ renderTabs }) => renderTabs())
  renderFileTree()
}
