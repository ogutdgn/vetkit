---
name: writing-commits
description: Use when about to create a git commit in the vetkit project, before composing the commit message. Enforces Conventional Commits prefix, English, lowercase imperative, max 3-4 sentences total, and forbids any Claude/AI attribution footer.
---

# Writing commits

## Overview

vetkit uses a strict commit style. Every commit must use a Conventional Commits prefix, be written in English, stay under 3-4 sentences total, and contain **no Claude/AI attribution** of any kind.

## Format

```
<type>(<scope>): <imperative lowercase summary, no trailing period>

<optional body — only if the WHY isn't obvious from the diff; max 3 short sentences>
```

- **type** (required): `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `build`, `ci`
- **scope** (required when one obviously applies): the area touched — `web`, `studio`, `readme`, `claude`, `execution-map`, `architecture`, `eslint`, `tailwind`, `deps`, `monorepo`, `packages`, etc.
- **summary**: imperative mood (`add`, `drop`, `fix`, `rename`), lowercase first letter, no trailing period
- **body**: optional. Skip entirely for one-liners. Add only when the *why* is non-obvious.

## Hard rules

| Rule | Why |
|---|---|
| English only | Project convention. |
| Conventional prefix required on every commit | Enables changelog/release tooling later. |
| Total message ≤ 3-4 sentences | Long commit messages don't get read. |
| One topic per commit | If summary needs "and" twice, split into separate commits. |
| **No `Co-Authored-By: Claude` footer** | Project owner's explicit instruction. |
| **No `🤖 Generated with Claude Code` line** | Same. |
| **No "based on Claude's suggestion", "AI-assisted", etc.** | Same. |

## Good examples (from this repo's history)

```
docs(readme): add public README with project overview, stack, and Dastugo credits
fix(web): drop redundant baseUrl from apps/web/tsconfig.json
docs(claude): reference EXECUTION-MAP.md from quick-start, roadmap, and folder layout
docs(execution-map): add live operational plan for Phase 1
chore(deps): commit pnpm-lock.yaml after initial workspace install
feat(studio): scaffold apps/studio with Sanity v3 and env-driven tenant config
```

With an optional body (only when justified):

```
feat(web): add Tailwind v4 with token-driven theme variables

Replaces inline placeholder styles. Tokens are exposed as CSS variables so
Sanity siteSettings can override brand color and font at runtime per tenant.
```

## Bad examples — DO NOT WRITE

```
❌ Update files
   (no prefix, vague)

❌ feat: stuff
   (no scope, empty summary)

❌ feat(web): added tailwind and eslint and fixed tsconfig and updated readme
   (4 topics in one commit — split into 4 commits)

❌ feat(web): Add Tailwind.
   (capitalized + trailing period)

❌ feat(web): tailwind kurulumu eklendi
   (Turkish — must be English)

❌ fix(web): drop redundant baseUrl

   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>
   (attribution footer is FORBIDDEN in this project)
```

## Splitting rule

If the summary needs "and" to describe two areas, split it.

- ❌ `chore: configure eslint and prettier`
- ✅ `chore(eslint): add flat config in packages/config-eslint`
- ✅ `chore(prettier): adopt shared .prettierrc at repo root`

Exception: tightly coupled changes that don't make sense apart (e.g. `feat(web): add contact route and its Resend client wrapper` is fine if neither works alone).

## Workflow

1. Run `git status` and `git diff --staged` to confirm what's actually staged.
2. Group changes by topic — would this be one commit or several? Split if needed.
3. For each topic, pick `<type>(<scope>)` and write a one-line lowercase imperative summary.
4. Add a body **only** if the *why* isn't visible from the diff. Max 3 short sentences.
5. For multi-line messages, use a single-quoted HEREDOC so PowerShell/$ aren't expanded:

```bash
git commit -m "$(cat <<'EOF'
feat(web): add Tailwind v4 with token-driven theme variables

Tokens are exposed as CSS variables so Sanity siteSettings can override
brand color and font at runtime per tenant.
EOF
)"
```

6. Run `git log -1` and verify: no attribution footer, no Turkish, no trailing period.

## Red flags — STOP and rewrite

- Capital letter right after the colon
- Trailing period on the summary
- `and` appears twice in the summary
- Body longer than 3 sentences
- Any line mentions `Claude`, `AI`, `Anthropic`, `Co-Authored-By`, `🤖`, or `Generated with`
- Made-up type (`update`, `change`, `misc`, `tweak`) instead of the allowed list
- Missing scope when one obviously applies
- Summary written in Turkish or any non-English language

## Common rationalizations

| Excuse | Reality |
|--------|---------|
| "It's a tiny change, prefix is overkill" | Every commit gets a prefix. Consistency > brevity. |
| "Co-Authored-By is the polite default" | Owner explicitly forbids it for this project. |
| "These 3 changes are related, one commit is cleaner" | Reviewability beats commit count. Split. |
| "Turkish summary is clearer for the owner" | Owner asked for English. Not your call. |
| "Longer body shows thoroughness" | If the diff already explains it, body is noise. |
| "No scope fits perfectly" | Pick the closest. `chore` with no scope is fine when truly cross-cutting. |
