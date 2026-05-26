// Re-exports the Sanity-generated schema types so route handlers, server
// components, and helpers in apps/web can `import type { Service } from
// '@/types/sanity'` without reaching across the monorepo boundary themselves.
//
// The single source of truth lives in `@vetkit/sanity-types`, generated from
// `apps/studio/schemas/` via `pnpm --filter @vetkit/studio typegen`.
export type * from '@vetkit/sanity-types';
