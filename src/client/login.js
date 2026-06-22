function showError(msg) {
  const el = document.getElementById('login-error')
  el.textContent = msg
  el.classList.remove('hidden')
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    window.location.href = '/'
    return
  }

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const password = document.getElementById('login-password').value
    const submitBtn = document.getElementById('login-submit')

    submitBtn.disabled = true

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        showError(data.error || 'Login failed')
        submitBtn.disabled = false
        return
      }

      localStorage.setItem('auth-token', data.token)

      const screen = document.getElementById('login-screen')
      screen.classList.add('fade-out')
      screen.addEventListener('transitionend', () => {
        window.location.href = '/'
      }, { once: true })
    } catch (err) {
      showError('Network error')
      submitBtn.disabled = false
    }
  })
})
