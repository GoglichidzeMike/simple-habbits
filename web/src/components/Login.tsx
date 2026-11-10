import { type FormEvent, useState } from 'react'
import { api } from '../api.ts'

export function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.login(password)
      onLoggedIn()
    } catch {
      setError('Wrong password')
      setBusy(false)
    }
  }

  return (
    <form className="center login" onSubmit={submit}>
      <h1>Habbit</h1>
      <input type="text" name="username" value="me" autoComplete="username" readOnly hidden />
      <input
        className="input"
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy || !password}>
        {busy ? 'Checking…' : 'Log in'}
      </button>
    </form>
  )
}
