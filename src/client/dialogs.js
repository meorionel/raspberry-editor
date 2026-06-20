function escapeHtml(str) {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function showDialog(bodyHtml, onSetup, cancelValue = null) {
  return new Promise(resolve => {
    const overlay = document.getElementById('dialog-overlay')
    const content = document.getElementById('dialog-content')
    overlay.classList.remove('hidden')
    content.innerHTML = bodyHtml
    function done(val) {
      overlay.classList.add('hidden')
      document.onkeydown = null
      resolve(val)
    }
    document.onkeydown = (e) => { if (e.key === 'Escape') done(cancelValue) }
    if (onSetup) onSetup(done)
  })
}

export function showPrompt(title, label, defaultValue) {
  return showDialog(`
    <div class="dialog-title">${escapeHtml(title)}</div>
    <input class="dialog-input" id="dialog-input" value="${escapeHtml(defaultValue)}" placeholder="${escapeHtml(label)}" autofocus />
    <div class="dialog-actions">
      <button class="btn" id="dialog-cancel">Cancel</button>
      <button class="btn" id="dialog-confirm">OK</button>
    </div>`,
    done => {
      const input = document.getElementById('dialog-input')
      input.select()
      document.getElementById('dialog-cancel').onclick = () => done(null)
      document.getElementById('dialog-confirm').onclick = () => done(input.value.trim() || null)
      input.onkeydown = (e) => {
        if (e.key === 'Enter') document.getElementById('dialog-confirm').click()
        if (e.key === 'Escape') document.getElementById('dialog-cancel').click()
      }
    }
  )
}

export function showList(title, items) {
  return showDialog(`
    <div class="dialog-title">${escapeHtml(title)}</div>
    <ul class="dialog-list">
      ${items.length ? items.map(item => {
        const size = item.size ? ` <span class="size">(${(item.size / 1024).toFixed(1)} KB)</span>` : ''
        return `<li data-key="${escapeHtml(item.key)}">${escapeHtml(item.key)}${size}</li>`
      }).join('') : '<li class="dialog-empty">No items</li>'}
    </ul>
    <div class="dialog-actions">
      <button class="btn" id="dialog-cancel">Cancel</button>
    </div>`,
    done => {
      document.getElementById('dialog-cancel').onclick = () => done(null)
      document.querySelectorAll('.dialog-list li[data-key]').forEach(li => {
        li.onclick = () => done(li.dataset.key)
      })
    }
  )
}

export function showConfirm(msg) {
  return showDialog(`
    <div class="dialog-title">${escapeHtml(msg)}</div>
    <div class="dialog-actions">
      <button class="btn" id="dialog-cancel">Cancel</button>
      <button class="btn" id="dialog-confirm">OK</button>
    </div>`,
    done => {
      document.getElementById('dialog-cancel').onclick = () => done(false)
      document.getElementById('dialog-confirm').onclick = () => done(true)
    },
    false
  )
}

export function showAlert(msg) {
  return showDialog(`
    <div class="dialog-title">${escapeHtml(msg)}</div>
    <div class="dialog-actions">
      <button class="btn" id="dialog-confirm">OK</button>
    </div>`,
    done => {
      document.getElementById('dialog-confirm').onclick = () => done()
    }
  )
}

export function showDropdown(triggerEl, items, { selectedKey, renderItem } = {}) {
  return new Promise(resolve => {
    document.querySelector('.dropdown-menu')?.remove()

    const menu = document.createElement('div')
    menu.className = 'dropdown-menu'

    for (const item of items) {
      const el = document.createElement('div')
      const sel = item.key === selectedKey
      el.className = 'dropdown-item' + (sel ? ' selected' : '')
      const check = '<span class="theme-check">' + (sel ? '●' : '') + '</span>'
      el.innerHTML = check + (renderItem ? renderItem(item) : escapeHtml(item.name || item.key))
      el.onclick = (e) => { e.stopPropagation(); cleanup(); resolve(item.key) }
      menu.appendChild(el)
    }

    const rect = triggerEl.getBoundingClientRect()
    document.body.appendChild(menu)
    menu.style.top = rect.bottom + 'px'
    menu.style.left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8) + 'px'
    menu.style.minWidth = Math.max(rect.width, 160) + 'px'

    function cleanup() {
      menu.remove()
      document.removeEventListener('click', onClickOutside)
      document.onkeydown = null
    }
    function onClickOutside(e) {
      if (!menu.contains(e.target)) { cleanup(); resolve(null) }
    }
    setTimeout(() => document.addEventListener('click', onClickOutside), 0)
    document.onkeydown = (e) => { if (e.key === 'Escape') { cleanup(); resolve(null) } }
  })
}
