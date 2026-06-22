import { Hono } from 'hono'
import type { Bindings } from './bindings'
import { renderer } from './renderer'
import { fileRoutes } from './routes/files'
import { authRoutes } from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { IndexPage } from './views/index'
import { LoginPage } from './views/login'

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => c.render(<IndexPage />))
app.get('/login', (c) => c.render(<LoginPage />))
app.route('/api/auth', authRoutes)
app.use('/api/files/*', authMiddleware)
app.route('/api/files', fileRoutes)

export default app
