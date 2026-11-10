import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { createHash, timingSafeEqual } from 'node:crypto'

const COOKIE = 'habbit_session'
const ONE_YEAR = 60 * 60 * 24 * 365

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}

const password = requireEnv('APP_PASSWORD')
const secret = requireEnv('SESSION_SECRET')
const secure = process.env.NODE_ENV === 'production'

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

function passwordMatches(input: string) {
  return timingSafeEqual(digest(input), digest(password))
}

async function isLoggedIn(c: Parameters<typeof getSignedCookie>[0]) {
  return (await getSignedCookie(c, secret, COOKIE)) === 'ok'
}

export const auth = new Hono()

auth.post('/login', async (c) => {
  const body = await c.req.json<{ password?: unknown }>().catch(() => ({ password: undefined }))
  if (typeof body.password !== 'string' || !passwordMatches(body.password)) {
    await new Promise((r) => setTimeout(r, 500))
    return c.json({ error: 'Wrong password' }, 401)
  }
  await setSignedCookie(c, COOKIE, 'ok', secret, {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/',
    maxAge: ONE_YEAR,
  })
  return c.json({ ok: true })
})

auth.post('/logout', (c) => {
  deleteCookie(c, COOKIE, { path: '/', secure })
  return c.json({ ok: true })
})

auth.get('/me', async (c) => c.json({ loggedIn: await isLoggedIn(c) }))

export const requireAuth = createMiddleware(async (c, next) => {
  if (!(await isLoggedIn(c))) return c.json({ error: 'Unauthorized' }, 401)
  await next()
})
