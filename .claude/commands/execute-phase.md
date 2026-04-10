---
description: Execute a single phase of a multi-phase plan file (e.g. `.plans/bot.md`) with strict guardrails that prevent hallucination, preserve the existing UI vibe on any frontend work, and enforce project best practices.
argument-hint: "<plan-file> <phase-identifier>"
---

# Execute Phase

Take one phase from a plan file and implement it — no more, no less — with guardrails that keep the work grounded in reality, consistent with the existing codebase, and aligned with the project's UI and engineering conventions.

## Inputs

The user invocation should supply:
1. **Plan file** — path to a markdown plan (e.g. `.plans/bot.md`). If omitted, check the currently-opened IDE file; if that's a plan, use it. Otherwise ask.
2. **Phase identifier** — "Phase 0", "phase 2", "the voice layer one", etc. If ambiguous, list the phases found in the plan and ask the user which one.

## Execution Protocol

Follow these steps in order. Do not skip ahead.

### 1. Load and parse the plan

- `Read` the entire plan file. Do not guess its contents from the filename.
- Identify the exact phase the user asked for. Copy its goal, task list, and exit criteria into a local todo list via `TodoWrite`. One todo per checklist item in the phase — verbatim.
- Read any earlier phases' exit criteria to understand the assumed starting state. If a prerequisite phase hasn't been completed (e.g. a file it was supposed to create is missing), **stop and tell the user** before editing anything.

### 2. Ground yourself in the codebase

Before writing a single line, verify every assumption the phase makes:

- For **every file path** the phase references, confirm it exists (`Read` or `Glob`). If it doesn't, note whether the phase is supposed to create it or whether the plan is stale.
- For **every library** the phase names, confirm it's installed — check `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, etc. Never `import` a package you haven't verified is a dependency.
- For **every symbol** (function, component, hook, type) the phase says to call or extend, `Grep` for its definition and read it. Do not infer signatures from the name.
- Skim 2–3 neighboring files in the same directory as any file you're about to create, so the new file matches local conventions (naming, exports, import order, comment style).

If any of the above turns up a contradiction with the plan, **surface it to the user** and propose either (a) amending the plan, or (b) adjusting the implementation. Do not silently route around it.

### 3. Anti-hallucination guardrails

These are hard rules. Apply them to every edit.

- **No invented APIs.** If you're about to call `foo.bar()`, you must have read `foo`'s definition or its published docs (via `WebFetch` for third-party libs) in this session. Gut-feel memory of an SDK is not sufficient.
- **No invented file paths.** Every `@/...`, relative import, or asset reference must resolve to a file you've confirmed exists (or that this phase is creating in the same change).
- **No invented types or props.** Before extending a component or passing props, read the component's prop type. Before destructuring a return value, read the function's return type.
- **No invented env vars or config keys.** `Grep` for existing usage before adding a new one; if it's new, add it to the example env file and mention it in the final report.
- **No invented commands or scripts.** Before running `npm run <x>`, confirm `<x>` exists in `package.json` scripts. Same for Makefile targets, justfile recipes, etc.
- **When uncertain, read — don't guess.** Reading one extra file is always cheaper than a fabricated fix that has to be unwound.
- **Cite file:line when claiming something exists.** In your final report, every "I used X from Y" claim should point to a real location.

### 4. UI vibe preservation (frontend changes only)

If the phase touches anything user-visible — components, pages, styles, layouts — protect the existing look and feel:

- **Detect the stack first.** Check `package.json` / equivalent for the UI library (e.g. Chakra UI, Tailwind + shadcn, MUI, Mantine, vanilla CSS modules, Sass). Use whatever is already there. **Never introduce a new UI library, CSS framework, or icon set** as part of a phase unless the phase explicitly calls for it.
- **Reuse existing primitives.** Before writing a new `<Button>`, `<Card>`, `<Modal>`, etc., `Grep` for existing ones in `components/`, `ui/`, `sections/`, or wherever the project keeps them. Extend or compose — don't parallel-implement.
- **Honor the design tokens.** Find where colors, spacing, typography, and radii are defined (theme file, `globals.css`, `tailwind.config`, CSS vars, Chakra theme). Pull values from there. Never hardcode a hex color, pixel value, or font family that isn't already in use elsewhere.
- **Match layout rhythm.** Open 1–2 sibling sections/pages and match their section padding, heading hierarchy, max-width, and breakpoint patterns. The new thing should feel like it was always there.
- **Match motion style.** If the project uses `framer-motion`, match existing easing/duration; if it doesn't animate, don't add animations "for polish."
- **Match iconography.** Use the icon set already in the project (e.g. `@icon-park/react`, `react-icons`, `lucide-react`). Don't mix sets.
- **Copy tone.** For any user-facing text, match the voice of existing copy in the same area. Read neighbors before writing.
- **Responsive + a11y parity.** If surrounding components are responsive and have a11y labels, yours must too. Don't regress the bar.

If the phase would force a visible departure from the current vibe, **pause and confirm with the user** before committing to it.

### 5. Engineering best practices

- **Follow existing patterns over textbook ones.** If the project organizes route handlers one way, new handlers go the same way. Consistency beats cleverness.
- **No speculative abstractions.** Don't add a helper, hook, context, or config flag until the phase actually needs it twice.
- **No unrequested refactors.** Leave code outside the phase's scope alone, even if it looks improvable. Note it in the final report instead.
- **Validate at boundaries only.** Don't sprinkle defensive checks through internal code. Trust types.
- **Errors fail loudly in dev, gracefully at the edge.** Don't swallow errors with empty `catch` blocks.
- **Secrets stay server-side.** Any API key, token, or credential referenced by the phase must be read from env on the server; never shipped to the client bundle. Flag any client-side leak you spot.
- **Accessibility is not optional.** Interactive elements need labels, focus states, and keyboard paths.
- **No dead code.** Delete what you replace. Don't leave `// old version` blocks behind.
- **Honor the phase's scope.** If the phase says "text chat only, no voice," do not start wiring voice "since I'm here anyway."

### 6. Verify before declaring done

Run whatever the project uses to catch errors, in this order:

1. Type checker (`tsc --noEmit`, `mypy`, `cargo check`, etc.) if the language has one.
2. Linter (`eslint`, `ruff`, `golangci-lint`, etc.) — only on the files you touched, not the whole repo.
3. Formatter if the project has one configured (`prettier`, `black`, `gofmt`).
4. Tests that cover the touched area, if they exist and are fast.
5. Dev build or dev server if the phase is UI-visible and the user can verify it locally.

Do not mark a todo complete until its implementation passes the relevant check. If a check fails, diagnose the root cause — don't paper over it with `@ts-ignore`, `// eslint-disable`, `any`, broad `except:`, or similar escape hatches. Using one of those requires explicit user approval and a one-line reason comment.

### 7. Update the plan file

Once the phase is genuinely complete:

- Tick the `- [ ]` boxes in the plan file that correspond to tasks you finished. Leave untouched any you didn't finish, and add a brief note (`<!-- deferred: ... -->`) explaining why.
- If you discovered the plan was wrong (stale path, missing prerequisite, incorrect assumption), add an `<!-- NOTE: ... -->` line near the affected bullet rather than silently editing the prose.
- Do **not** tick items in phases other than the one the user asked you to execute.

### 8. Report back

End with a concise summary:

1. **Phase executed** — name + plan file link.
2. **What changed** — bullet list of files touched with `file:line` links, grouped by "created / modified / deleted."
3. **Checks run** — which verifications passed (typecheck, lint, build, tests).
4. **Exit criteria status** — did the phase's stated exit criteria get met? Yes / no / partial, with evidence.
5. **Deferred or blocked** — anything in the phase you deliberately did not do, and why.
6. **Things the user should verify manually** — anything a machine check can't catch (visual QA, voice playback, real-device test).
7. **Suggested next phase** — only if the user asks. Don't auto-start the next phase.

## Hard "do not" list

- Do not execute more than the one requested phase.
- Do not commit, push, or open a PR unless the user asks.
- Do not install new dependencies unless the phase explicitly requires them — and if it does, confirm the exact package name and version with the user first.
- Do not delete files outside the phase's scope.
- Do not edit `.env`, `.env.local`, or any secret file. Tell the user what to add and let them do it.
- Do not disable or weaken existing lint/type rules to make your code compile.
- Do not fabricate test results. If you didn't run it, say so.

## When to stop and ask

Pause and get user input whenever:
- A prerequisite phase hasn't been completed.
- The plan contradicts the current state of the repo.
- Implementing the phase as written would break the UI vibe or introduce a new UI library.
- The phase is ambiguous enough that two reasonable implementations would differ materially.
- A verification check fails and the root cause is outside the phase's scope.

Silence is not a virtue here. A 30-second clarification beats a 30-minute wrong turn.
