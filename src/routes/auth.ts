import { Hono } from 'hono'
import { SignJWT } from 'jose'
import type { Bindings } from '../bindings'

let failedAttempts = 0
let locked = false

const app = new Hono<{ Bindings: Bindings }>()

app.post('/login', async (c) => {
  if (locked) {
    return c.json({ error: 'Locked. Redeploy to unlock.' }, 403)
  }

  const { password } = await c.req.json<{ password: string }>()

  if (password !== c.env.PASSWORD) {
    failedAttempts++
    if (failedAttempts >= 5) {
      locked = true
      return c.json({ error: 'Locked. Redeploy to unlock.' }, 403)
    }
    return c.json({ error: `Invalid password (${5 - failedAttempts} attempts left)` }, 401)
  }

  failedAttempts = 0

  const secret = new TextEncoder().encode(c.env.JWT_SECRET)
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  return c.json({ token })
})

export { app as authRoutes }
