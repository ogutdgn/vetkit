// Re-exports the Sanity-generated types so consumers import from a single
// stable entry point: `import type { Service } from '@vetkit/sanity-types'`.
//
// The `generated.ts` file is produced by `pnpm --filter @vetkit/studio typegen`
// and is checked in (so Vercel/CI don't need to run codegen).
export * from './generated';
