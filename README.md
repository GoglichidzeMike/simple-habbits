# Habbit

Personal habit tracker PWA. Hono + SQLite API, React + Vite frontend, one Node service.

## Local

```
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. The API runs on :3000 and Vite proxies `/api` to it.

- `npm test`: streak and date tests
- `npm run typecheck`
- `npm run build && npm start`: production mode on :3000
- `npm run icons`: regenerate PNG icons from `web/public/icon.svg`

## Railway

1. Push to GitHub and create a Railway service from the repo.
2. Add a Volume to the service and mount it at `/data`.
3. Set these variables:
   - `APP_PASSWORD`: your login password
   - `SESSION_SECRET`: long random string (`openssl rand -hex 32`)
   - `DB_PATH=/data/habits.db`
4. Railway picks up `npm run build` and `npm start` from package.json. Optionally set the healthcheck path to `/api/health`.
5. Generate a domain under Settings → Networking.

## iPhone

Open the URL in Safari, log in, then Share → Add to Home Screen.

## Backup

Footer → Export data downloads all habits and check-ins as JSON.
# simple-habbits
# simple-habbits
