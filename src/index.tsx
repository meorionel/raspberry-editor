import { Hono } from 'hono'
import type { Bindings } from './bindings'
import { renderer } from './renderer'
import { fileRoutes } from './routes/files'
import { IndexPage } from './views/index'

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => c.render(<IndexPage />))
app.route('/api/files', fileRoutes)

export default app
