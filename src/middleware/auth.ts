import { createMiddleware } from 'hono/factory'
import { jwtVerify } from 'jose'
import type { Bindings } from '../bindings'

export const authMiddleware = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET)
    await jwtVerify(token, secret)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})
