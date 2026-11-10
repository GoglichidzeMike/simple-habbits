import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { readFileSync } from 'node:fs'
import { auth, requireAuth } from './auth.ts'
import { api } from './routes.ts'

const app = new Hono()

app.get('/api/health', (c) => c.json({ ok: true }))
app.route('/api', auth)
app.use('/api/*', requireAuth)
app.route('/api', api)
app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))

if (process.env.NODE_ENV === 'production') {
  const indexHtml = readFileSync('./dist/index.html', 'utf8')
  app.use(
    '/*',
    serveStatic({
      root: './dist',
      onFound: (path, c) => {
        if (path.includes('/assets/')) c.header('Cache-Control', 'public, max-age=31536000, immutable')
        else c.header('Cache-Control', 'no-cache')
      },
    }),
  )
  app.get('*', (c) => {
    c.header('Cache-Control', 'no-cache')
    return c.html(indexHtml)
  })
}

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port }, () => console.log(`habbit listening on :${port}`))
