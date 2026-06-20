import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Editor</title>
        <link rel="icon" href="/logo.png" />
        <ViteClient />
        <style>{`:root{--bg:#191724;--border:#26233a;--accent:#ebbcba}`}</style>
        <Link href="/src/style.css" rel="stylesheet" />
        <Link href="/fonts/maple-mono.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/loader.js"></script>
        <script>{`require.config({paths:{vs:'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs'}});window.monacoReady=new Promise(r=>require(['vs/editor/editor.main'],r))`}</script>
      </head>
      <body>{children}</body>
    </html>
  )
})
