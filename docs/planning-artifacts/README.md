# Planning Artifacts

This folder contains the planning artifacts produced before implementation began. They are the canonical source for what the product is, what good looks like, and how the system is structured.

## Reading order

1. **[Product Brief](product-brief.md)** — Vision, target users, strategic posture. Why we are building this.
2. **[PRD](prd.md)** — Functional and non-functional requirements with IDs. What good looks like.
3. **[Architecture](architecture.md)** — Locked technology decisions, module boundaries, locked default values. How the system is structured.
4. **[Epics and Stories](epics.md)** — 8 epics, 24 PR-sized stories. Implementation sequence.

## Related files outside this folder

- **[`/docs/project-context.md`](../project-context.md)** — 20 numbered rules for AI agents working in this repo. Distills the architecture into operational do-and-don't rules. Read carefully before writing code.
- **[`/docs/implementation-artifacts/sprint-status.yaml`](../implementation-artifacts/sprint-status.yaml)** — Story tracker. You update this as stories move through their lifecycle.
- **[`/docs/implementation-artifacts/ai-usage.md`](../implementation-artifacts/ai-usage.md)** — Template for your AI usage report.

## Authorship

All artifacts in this folder were authored using the BMAD Method by the Design Pickle interview team. They are not for editing — your job is to execute against them. If you find something wrong or want to deviate, document the deviation in the relevant PR description rather than editing the artifact.

## Cross-references

Artifacts reference each other by FR and NFR IDs. When you see `FR8` in a story acceptance criterion, that is functional requirement 8 in `prd.md`. When you see `NFR4`, same pattern. The architecture doc and `project-context.md` both cite back to PRD IDs so you can trace any decision to its origin.

## Quick map

| Looking for... | Read |
| --- | --- |
| Why this project exists | `product-brief.md` |
| What features are required and what success looks like | `prd.md` |
| What stack to use, how libraries are organized, what defaults are locked | `architecture.md` |
| Hard rules and gotchas for AI-assisted implementation | `../project-context.md` |
| Which story to pick next | `epics.md` plus `../implementation-artifacts/sprint-status.yaml` |
| Stretch tiers and what counts as optional | `epics.md`, epics 5–8 |
