export function IndexPage() {
  return (
    <>
      <div id="loading-screen">
        <img class="loading-logo" src="/logo.png" alt="logo" />
        <div class="spinner"></div>
      </div>
      <div id="app">
        <div id="menubar">
          <span style="flex:1"></span>
          <button id="btn-theme" class="btn">Theme</button>
          <button id="btn-font" class="btn">Font</button>
        </div>
        <div id="main">
          <div id="sidebar">
            <div class="sidebar-header">
              <span>Files</span>
              <div class="sidebar-actions">
                <button class="btn btn-sm sidebar-btn" title="New File">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M12 11l0 6"/><path d="M9 14l6 0"/></svg>
                </button>
                <button class="btn btn-sm sidebar-btn" title="New Directory">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5"/><path d="M16 19h6"/><path d="M19 16v6"/></svg>
                </button>
                <button class="btn btn-sm sidebar-btn" title="Refresh file list">
                  <svg width="14" height="14" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747"/><path d="M20 4v5h-5"/></g></svg>
                </button>
              </div>
            </div>
            <div id="file-tree"></div>
          </div>
          <div id="editor-area">
            <div id="tabbar"></div>
            <div id="editor-container"></div>
            <div id="welcome">
              <img class="welcome-logo" src="/logo.png" alt="logo" />
            </div>
          </div>
        </div>
        <div id="statusbar">
          <span id="status-lang">Plain Text</span>
          <span id="status-encoding">UTF-8</span>
        </div>
        <div id="dialog-overlay" class="hidden">
          <div id="dialog-box">
            <div id="dialog-content"></div>
          </div>
        </div>
      </div>
      <script type="module" src="/src/client/main.js"></script>
    </>
  )
}
