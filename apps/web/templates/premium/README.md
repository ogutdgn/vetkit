# premium — not yet implemented

Phase 3 template (CLAUDE.md §2.4) — built only if a third client requests
something `modern` and `classic` cannot deliver. Two solid templates beat
three half-finished ones.

When implemented, this folder must export a default object satisfying the
`ThemeComponents` contract in [`apps/web/types/template.ts`](../../types/template.ts) —
same component names, same props as every other template — plus its own
`tokens.css` for default colors/fonts.
