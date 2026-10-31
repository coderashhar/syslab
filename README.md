# SysLab

SysLab is an interactive system design learning platform. The first vertical slice is a Token Bucket rate limiting lab with a guided lesson and a deterministic client-side simulation engine.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## First slice

- Landing page and learning map
- Token Bucket lesson at `/learn/rate-limiting/token-bucket`
- Interactive playground at `/playground`
- Shared virtual-clock simulation engine in `src/engine/simulation`
- Pure Token Bucket implementation in `src/engine/algorithms/tokenBucket.js`
- Vitest coverage for refill, capacity, acceptance, rejection, and deterministic replay

The remaining algorithm routes are present as milestone placeholders so the information architecture is stable while the next adapters are built.
