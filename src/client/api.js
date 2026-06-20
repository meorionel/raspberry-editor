import { state } from './state'

const extMap = {
  js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
  html: 'html', css: 'css', json: 'json', md: 'markdown', xml: 'xml',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
  c: 'c', cpp: 'cpp', h: 'c', cs: 'csharp', php: 'php',
  sh: 'shell', bash: 'shell', yaml: 'yaml', yml: 'yaml',
  toml: 'plaintext', sql: 'sql', graphql: 'graphql',
  txt: 'plaintext', log: 'plaintext', env: 'plaintext',
}

export function langFromKey(key) {
  const ext = key.includes('.') ? key.split('.').pop().toLowerCase() : ''
  return extMap[ext] || 'plaintext'
}

export function updateStatusLang(key) {
  const el = document.getElementById('status-lang')
  if (el) el.textContent = langFromKey(key)
}

export function updateStatus(msg) {
  const el = document.getElementById('status-lang')
  if (el) el.textContent = msg
  setTimeout(() => {
    if (state.activeKey) updateStatusLang(state.activeKey)
  }, 2000)
}

export function showLanguagePicker() {
  const allLangs = monaco.languages.getLanguages().map(l => l.id).sort()
  import('./dialogs.js').then(({ showList }) => {
    showList('Select Language', allLangs.map(id => ({ key: id }))).then(id => {
      if (!id) return
      const model = state.editor.getModel()
      if (model) monaco.editor.setModelLanguage(model, id)
      document.getElementById('status-lang').textContent = id
    })
  })
}

export async function api(path, options = {}) {
  const res = await fetch('/api/files' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
