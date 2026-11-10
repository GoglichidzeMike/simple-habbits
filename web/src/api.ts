export type Habit = {
  id: number
  name: string
  color: string
  archived: boolean
  createdAt: string
  days: string[]
}

export class UnauthorizedError extends Error {}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  })
  if (res.status === 401) throw new UnauthorizedError('Unauthorized')
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? `Request failed (${res.status})`)
  }
  return res.json()
}

export const api = {
  me: () => request<{ loggedIn: boolean }>('GET', '/me'),
  login: (password: string) => request<{ ok: true }>('POST', '/login', { password }),
  logout: () => request<{ ok: true }>('POST', '/logout'),
  habits: () => request<Habit[]>('GET', '/habits'),
  create: (name: string, color: string, today: string) => request<Habit[]>('POST', '/habits', { name, color, today }),
  update: (id: number, patch: Partial<Pick<Habit, 'name' | 'color' | 'archived'>>) =>
    request<Habit[]>('PATCH', `/habits/${id}`, patch),
  remove: (id: number) => request<Habit[]>('DELETE', `/habits/${id}`),
  reorder: (ids: number[]) => request<Habit[]>('PUT', '/habits/order', { ids }),
  setDay: (id: number, day: string, done: boolean) =>
    request<{ ok: true }>(done ? 'PUT' : 'DELETE', `/habits/${id}/days/${day}`),
}

export const COLORS = ['#22c55e', '#14b8a6', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#eab308']
