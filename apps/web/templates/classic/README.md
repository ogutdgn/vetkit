# classic — not yet implemented

Phase 2 template (CLAUDE.md §2.4). Built after the first client ships on
`modern` and the schema is validated with real content; ovapark-veteriner
migrates onto it.

When implemented, this folder must export a default object satisfying the
`ThemeComponents` contract in [`apps/web/types/template.ts`](../../types/template.ts) —
same component names, same props as every other template — plus its own
`tokens.css` for default colors/fonts.
