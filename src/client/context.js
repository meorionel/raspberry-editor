import { newFileInline, newDirInline, deleteFile, startRename } from './filetree'

export function showContextMenu(e, key, isFolder) {
  e.preventDefault()
  e.stopPropagation()
  document.querySelector('.context-menu')?.remove()

  const menu = document.createElement('div')
  menu.className = 'context-menu'
  const items = []

  if (isFolder) {
    items.push(
      { label: 'New File', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M12 11l0 6"/><path d="M9 14l6 0"/></svg>', action: () => { cleanup(); newFileInline(key || '') } },
      { label: 'New Directory', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5"/><path d="M16 19h6"/><path d="M19 16v6"/></svg>', action: () => { cleanup(); newDirInline(key || '') } },
    )
  }
  if (key) {
    items.push(
      { label: 'Rename', svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/><path d="M16 19h6"/></svg>', action: () => { cleanup(); startRename(key) } },
      { label: 'Delete', svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-11l-5 -5a1.5 1.5 0 0 1 0 -2l5 -5l11 0"/><path d="M12 10l4 4m0 -4l-4 4"/></svg>', action: () => { cleanup(); deleteFile(key) } },
    )
  }

  for (const item of items) {
    const el = document.createElement('div')
    el.className = 'context-menu-item'
    el.innerHTML = item.svg + '<span>' + item.label + '</span>'
    el.onclick = item.action
    menu.appendChild(el)
  }

  document.body.appendChild(menu)
  menu.style.left = e.clientX + 'px'
  menu.style.top = e.clientY + 'px'
  const rect = menu.getBoundingClientRect()
  if (rect.right > window.innerWidth) menu.style.left = (e.clientX - rect.width) + 'px'
  if (rect.bottom > window.innerHeight) menu.style.top = (e.clientY - rect.height) + 'px'

  function cleanup() {
    menu.remove()
    document.removeEventListener('click', onClickOutside)
    document.onkeydown = null
  }
  function onClickOutside(e2) {
    if (!menu.contains(e2.target)) cleanup()
  }
  setTimeout(() => document.addEventListener('click', onClickOutside), 0)
  document.onkeydown = (e2) => { if (e2.key === 'Escape') cleanup() }
}
