import { Hono } from 'hono'
import type { Bindings } from '../bindings'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const bucket = c.env.FILE_BUCKET
  const objects = await bucket.list()
  const files = objects.objects.map((o) => ({
    key: o.key,
    size: o.size,
    uploaded: o.uploaded,
  }))
  return c.json(files)
})

app.get('/:key', async (c) => {
  const key = c.req.param('key')
  const bucket = c.env.FILE_BUCKET
  const object = await bucket.get(key)
  if (!object) return c.json({ error: 'not found' }, 404)
  const text = await object.text()
  return c.json({ key, content: text })
})

app.post('/:key', async (c) => {
  const key = c.req.param('key')
  const { content } = await c.req.json()
  const bucket = c.env.FILE_BUCKET
  await bucket.put(key, content)
  return c.json({ success: true, key })
})

app.post('/rename', async (c) => {
  const { oldKey, newKey } = await c.req.json<{ oldKey: string; newKey: string }>()
  if (!oldKey || !newKey) return c.json({ error: 'oldKey and newKey required' }, 400)
  const bucket = c.env.FILE_BUCKET
  const isDir = oldKey.endsWith('/')

  if (isDir) {
    const newDirKey = newKey.endsWith('/') ? newKey : newKey + '/'
    const objects = await bucket.list({ prefix: oldKey })
    for (const obj of objects.objects) {
      const existing = await bucket.get(obj.key)
      if (!existing) continue
      const content = await existing.text()
      const relativePath = obj.key.slice(oldKey.length)
      await bucket.put(newDirKey + relativePath, content)
    }
    for (const obj of objects.objects) {
      await bucket.delete(obj.key)
    }
  } else {
    const object = await bucket.get(oldKey)
    if (!object) return c.json({ error: 'source not found' }, 404)
    const content = await object.text()
    await bucket.put(newKey, content)
    await bucket.delete(oldKey)
  }

  return c.json({ success: true, oldKey, newKey })
})

app.delete('/:key', async (c) => {
  const key = c.req.param('key')
  const bucket = c.env.FILE_BUCKET
  const recursive = c.req.query('recursive') === 'true'

  if (recursive) {
    const objects = await bucket.list({ prefix: key })
    for (const obj of objects.objects) {
      await bucket.delete(obj.key)
    }
    return c.json({ success: true, deleted: objects.objects.length, key })
  }

  await bucket.delete(key)
  return c.json({ success: true, key })
})

export { app as fileRoutes }
