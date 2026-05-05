# Frontend Take-Home Project: Conway's Game of Life

## Context

Thanks for making it through the Meet & Greet. This take-home is the next step in our process. It exists to give us signal on three things at once:

1. How you build a real frontend app with our stack.
2. How you direct AI tooling as part of your delivery flow.
3. How you reason about trade-offs out loud.

Plan for **6 to 8 hours of focused work**, submitted within **7 calendar days** from when you received this brief. Quality over completeness. We would rather see four things done well than ten things half-built.

---

## The Problem

Build a web app that lets a user play **Conway's Game of Life**.

Background, if you need it: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

The rules are simple and deterministic, which means correctness is testable. Treat them as such.

### Required Functionality

The app must let a user:

1. **Define the canvas size.** Width and height in cells. The user picks. Reasonable bounds are your call (justify them in your README).
2. **Set the starting state.** Click cells to toggle alive/dead before pressing play. Allow clear and randomize as well.
3. **Run the simulation.** Play, pause, and step. The user can adjust simulation speed (generations per second) while the simulation is running.

That is the floor. What you build beyond that is your call, see "Stretch Areas" below.

---

## Required Stack

This mirrors what you would actually work in if hired. No substitutions.

- **Frontend:** Next.js (TypeScript)
- **Monorepo:** Nx with at least one shared library and enforced module boundaries
- **Testing:** Jest for unit and integration tests, Playwright for at least one E2E flow
- **Styling:** your call. Tailwind, CSS Modules, vanilla CSS, all fine.
- **Target:** modern evergreen browsers, desktop and mobile responsive.

If you choose to add a backend, use **NestJS (TypeScript)**. See "Stretch Areas."

---

## Required Deliverables

A single GitHub repo (private) with [`@arnoe`](https://github.com/arnoe) and [`@rafaelpx`](https://github.com/rafaelpx) added as collaborators, containing:

### 1. Working application

- Runs locally with documented setup steps. Ideally one command from clone to running app.
- A deployed preview is appreciated but not required. Vercel is fine if you want to.

### 2. Git workflow and CI

We want to see how you ship, not just what you ship.

- **All work via pull requests into `main`.** No direct pushes. Branch protection enforced.
- **Focused commits with clear descriptions.** Each commit should be small enough that you can describe its intent in one sentence. We will read your git log as part of the evaluation.
- **First commit is your scaffolding.** Run the Nx generators and commit the output untouched as your first commit, before you write anything yourself. This lets us see clearly what you authored vs what the tooling generated.
- **GitHub Actions on every PR.** Lint, type-check, unit tests, and Playwright. Failing checks block merge.
- **Auto-approve PRs on green checks.** Configure the workflow so a PR with all checks passing is auto-approved and ready to merge.

### 3. Tests

Tests are a delivery gate, not a bonus.

- **Unit tests** for the simulation logic. The Game of Life rules are pure functions, treat them that way.
- **At least one Playwright E2E test** that covers the happy path: set canvas size, draw a starting state, run simulation.
- Coverage target is your call. Justify it in the README.

### 4. AI tooling co-located with the code

We use AI agents heavily in delivery. We need to see how you use them. **Commit your AI artifacts to the repo alongside the code**, not in a private setup elsewhere.

Depending on your workflow, that means things like:

- Custom agents, rules, or commands you used (Cursor rules, Claude Code agents, repo-level AI configs, custom slash commands).
- Notable prompts, playbooks, or task files that drove non-trivial pieces of work.
- A short note on which AI tools you used, where they helped, and where they failed you.

If you used AI without leaving a trace, we lose the ability to evaluate that part of your work. **No traces, no signal.**

### 5. README with rationale

Not a setup guide. A thinking document. We want to see:

- Architecture overview, with module boundaries and why you chose them.
- Trade-offs you made and what you explicitly chose not to build.
- How you used AI in the build, with concrete examples.
- What you would do next if you had another 8 hours.
- Anything you are not happy with and why you shipped it anyway.

### 6. A 5 minute Loom (or equivalent) walkthrough

Walk through your solution: architecture, one or two trade-offs, a piece of AI-assisted work you are proud of, a piece you are not. Keep it tight. We respect concise.

---

## Stretch Areas

Pick what plays to your strengths. Depth in one area beats surface in five.

### Frontend depth

- Performance: 60fps simulation on a 200x200 grid. Web workers, OffscreenCanvas, requestAnimationFrame strategy, render diffing. Show how you measured.
- UX polish: pan and zoom, keyboard shortcuts, mobile touch interactions, accessibility for the canvas controls.
- Pattern library: load named patterns (glider, blinker, Gosper glider gun) into the grid.

### Backend overlap (bonus)

We are mostly evaluating frontend, but if you want to show range:

- A NestJS service to save and share starting patterns (REST or GraphQL, your call).
- Server-side simulation for grids too large to compute client-side.
- Real-time collaborative editing via a NestJS gateway.

Any backend you add follows the same testing and AI co-location rules.

### Architectural reasoning

- Show enforced Nx module boundaries that would actually catch a cross-boundary import in CI.
- A pluggable rule engine, so the standard Game of Life is one rule set among others (HighLife, Day and Night, etc.).

---

## What We Are Looking At

We will evaluate the submission on:

- **Frontend craft.** Component boundaries, state management, hooks design, render performance, responsive behavior.
- **Code quality and modularity.** Can a teammate find what they need fast? Are concerns separated cleanly? Does the Nx structure pull its weight?
- **Test signal.** Are the tests testing the right things? Does the unit suite actually constrain the simulation logic? Does the E2E catch what E2E should catch?
- **AI fluency.** How well you direct AI tooling, evaluate its output, and recover when it is wrong. We see this through commits, AI artifacts, and the README.
- **Judgment.** What you chose to build, what you chose to skip, and how clearly you explain why.
- **Communication.** README and Loom.

We are explicitly not evaluating:

- Visual design as art. A clean, functional UI is enough.
- Feature count. More features does not score higher. Better thinking does.

---

## Things to Avoid

Direct, so you do not waste time on the wrong things:

- Tests added in the last hour to hit a coverage number. We can tell.
- Framework or library hopping to demonstrate breadth. Stick to the stack.
- AI-generated code committed without review or rationale. We are looking for engineers who direct AI, not engineers who paste it.
- A README that is just setup steps. The thinking is the point.
- Scope creep. A polished MVP beats a broken full feature list.
- "I would have added tests but ran out of time." Plan accordingly.

---

## Submission

When you are done:

1. Push the repo and add [`@arnoe`](https://github.com/arnoe) and [`@rafaelpx`](https://github.com/rafaelpx) as collaborators.
2. Reply to the original email thread with: the repo URL, the Loom link, and any notes you want us to read first.
3. We will review and come back within 5 business days with next steps.

Questions during the build are welcome. Reply to the same thread, we will respond within one workday.

Please keep this assessment confidential. Other candidates are working through the same brief.

Your work remains yours. This is a hiring assessment, not contracted delivery.

Good luck.
