export function LoginPage() {
  return (
    <>
      <div id="login-screen">
        <div id="login-user">
          <img class="login-avatar" src="/logo.png" alt="logo" />
          <span class="login-username">Raspberry Editor</span>
        </div>
        <form id="login-form">
          <div class="login-password-wrap">
            <input
              type="password"
              id="login-password"
              class="login-input"
              placeholder="Password"
              autocomplete="current-password"
              required
            />
            <button type="submit" class="login-submit" id="login-submit" aria-label="Login">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p id="login-error" class="login-error hidden"></p>
        </form>
      </div>
      <script type="module" src="/src/client/login.js"></script>
    </>
  )
}
