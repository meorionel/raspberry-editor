import { state } from './state'

export async function loadIconTheme() {
  try {
    const res = await fetch('/icon-theme.json')
    state.iconTheme = await res.json()
    import('./filetree.js').then(({ renderFileTree }) => renderFileTree())
  } catch (e) {
    console.warn('Failed to load icon theme:', e)
  }
}

export function iconPath(key, isFolder, folderName) {
  if (!state.iconTheme) return ''
  const defs = state.iconTheme.iconDefinitions
  let iconName
  if (isFolder) {
    iconName = state.iconTheme.folderNames?.[folderName] || state.iconTheme.folder
  } else {
    const fileName = key.split('/').pop()
    iconName = state.iconTheme.fileNames?.[fileName]
    if (!iconName) {
      const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : ''
      iconName = state.iconTheme.fileExtensions?.[ext] || state.iconTheme.file
    }
  }
  const def = defs[iconName]
  return def ? def.iconPath.replace('./icons/', '/icons/') : '/icons/text_dark.svg'
}
