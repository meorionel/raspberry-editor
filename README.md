```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Secrets Configuration

This editor uses password protection with JWT authentication. Set the following secrets:

```bash
wrangler secret put PASSWORD     # Login password
wrangler secret put JWT_SECRET   # Random long string for JWT signing
```

5 failed login attempts will lock the instance. Redeploy (`wrangler deploy`) to unlock.
