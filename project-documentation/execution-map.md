# Execution map

> **The single answer to "what do I work on next?"** — focused, ordered, _next session only_.
>
> **Read with siblings:**
>
> - [`plan.md`](./plan.md) — full roadmap, granular ordered backlog, open decisions. Skim before changing scope.
> - [`last-point.md`](./last-point.md) — what was actually done in the last session, current working tree.
> - [`../CLAUDE.md`](../CLAUDE.md) — architectural source of truth.
>
> **Maintenance:** Update at the **start** of every session (confirm the active chunk is still right) and at the **end** of every session (set the next chunk). Skill `updating-execution-map` at `.claude/skills/updating-execution-map/SKILL.md` codifies the protocol.

---

## 1. Active chunk — what to build next

**Chunk 12 — Contact form + Resend (`app/api/contact/route.ts`).**

**Goal:** A working contact form on `/iletisim`: React Hook Form + Zod on the client, a route handler that emails the submission to the clinic via Resend (email-only, NO database — CLAUDE.md §2.3). The iletisim page shell already exists with a placeholder comment.

**Locked context:**

- Stack per CLAUDE.md §3: React Hook Form + Zod, Resend + React Email. New deps to install in apps/web: `react-hook-form`, `zod`, `@hookform/resolvers`, `resend`, `react-email`/`@react-email/components` (check current package names/APIs before writing code).
- Env contract (§8, already in .env.example): `RESEND_API_KEY`, `CLINIC_EMAIL` (recipient), `CONTACT_FROM_EMAIL` (verified sender). Dev values can use Resend's onboarding sender (`onboarding@resend.dev`) + the owner's inbox; a real Resend key is an owner action.
- `components/shared/ContactForm.tsx` (client component) per the §4 tree; the API route validates AGAIN server-side with the same Zod schema (never trust the client).
- Spam floor: honeypot field + minimal rate limiting consideration (keep simple — no extra infra; document what's deferred).
- Turkish UX: labels/messages/validation errors in Turkish; success/failure states; accessible (labels, aria-invalid, focus on error).

**Done when:**

- `/iletisim` renders the form (name, phone, email, message — optionally pet type); client + server Zod validation share one schema.
- `app/api/contact/route.ts` sends via Resend to `CLINIC_EMAIL` with a readable email (React Email template or simple HTML) and returns proper status codes; errors surface in the UI in Turkish.
- Honeypot silently drops bot submissions.
- `.env.example` stays accurate; missing env vars fail loudly at submit time with a clear server log (not a silent 200).
- `pnpm typecheck` / `lint` / `build` pass; manual browser test of the happy path + a validation error (real send requires the owner's Resend key — verify with it if provided, otherwise mock/log mode).

**Depends on:** Chunk 11 (iletisim page) — shipped.

**Open decisions that affect this chunk:**

- None blocking. OD-3 (CI timing) is open but does not block this chunk.

**Suggested commit split** (per `.claude/skills/writing-commits/SKILL.md`):

1. `feat(web): add contact form with shared zod validation`
2. `feat(web): add contact api route sending via resend`
3. One combined `docs(project): wrap chunk 12` at session end.

Chunk 13 (revalidation webhook) follows — the cache-tag groundwork is fully laid; it closes the local stale-cache gotcha.

---

## 2. Pickup protocol — start of every session

1. **Read [`last-point.md`](./last-point.md)** to confirm the snapshot of where things stopped.
2. **Cross-check with `git log --oneline -5` and `git status`** — does reality match the snapshot? If not, update last-point.md before doing any work (use `writing-last-point` skill).
3. **Confirm the active chunk above (§1) is still right.** If [`plan.md`](./plan.md) was reordered or a decision was resolved since last session, adjust §1 before starting work.
4. **Skim open decisions in [`plan.md`](./plan.md) §3** — does the active chunk depend on an unresolved one? Raise it now, not after the chunk is half-done.
5. **Do the work.** Commit per `.claude/skills/writing-commits/SKILL.md`.

---

## 3. Wrap-up protocol — end of every session

1. **Refresh [`last-point.md`](./last-point.md)** — last commit hash, what got done, anything left dangling (use `writing-last-point` skill).
2. **Update §1 of this file** — set the new active chunk for the next session (use `updating-execution-map` skill).
3. **Update [`plan.md`](./plan.md)** — check off completed items, log resolved decisions in CLAUDE.md §12, reorder if scope shifted (use `updating-plan` skill).
4. **Commit the doc updates as ONE combined docs commit** (owner preference, 2026-06-06), e.g. `docs(project): wrap chunk N` covering plan.md + execution-map.md + last-point.md + any doc fixes. Never mix docs with feature code.

This file should never go more than one chunk out of date.
