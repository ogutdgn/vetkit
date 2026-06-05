// Cache-tag convention — OD-5, resolved 2026-05-30 (CLAUDE.md §12).
// Namespaced and `_id`-based so tags survive slug renames:
//   single doc   → sanity:<type>:<id>     (e.g. sanity:service:abc123)
//   collections  → sanity:<type>:list     (e.g. sanity:service:list)
//   singleton    → sanity:siteSettings
// The revalidation webhook (Chunk 13) computes the same tags from its payload
// and calls `revalidateTag` on exactly the affected entries.

export const siteSettingsTag = 'sanity:siteSettings';

export function listTag(type: string): string {
  return `sanity:${type}:list`;
}

export function docTag(type: string, id: string): string {
  return `sanity:${type}:${id}`;
}
