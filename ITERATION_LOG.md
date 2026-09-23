# Iteration Log — Review PR Comments Skill

EDD (Red → Green → Refactor) development of a skill prompt that reads a pull
request's source code plus its GitHub review comments and decides how each
comment should be handled (fix now / valid, subjective-optional, out-of-scope,
incorrect-reject, or dependent-on-other-fix).

**What is being evaluated:** a skill prompt (`review-pr-comments-prompt.md`),
not a chatbot reply. It is given a fixed fixture PR and must classify each
review comment's disposition.

**Controls held constant across all steps:**
- Fixture: `fixture/source/` (a small math app) + `fixture/comments/pr-review-comments.md` (7 review comments)
- Provider under test: Kiro CLI · `claude-sonnet-4.6`
- Rubric grader: Kiro CLI · `claude-sonnet-4.6`
- Eval config: `promptfooconfig.yaml`, tests in `review-comments-tests.yaml`
- Run command: `task eval` (always `--no-cache`)

Every number below comes from a `task eval` run — nothing is hand-computed.

---

## Cumulative Results

Pass rate per test case (and overall), by step. Add a column per step.

| Test case / metric         | Step 0 (NOP) |
|----------------------------|:------------:|
| _(no real assertions yet)_ | —            |
| **Tests passed**           | 0 / 0        |
| **Pass rate**              | n/a          |
| **Gate (all pass)**        | —            |

> Step 0 is the baseline: the prompt is a NOP ("You are a helpful assistant.")
> and `review-comments-tests.yaml` is empty, so there are no real assertions to
> fail yet. The first authored evals land in Step 1 and are expected to fail Red.

---

## 🔴 Step 0 — Baseline (NOP prompt, no evals)

**Date:** 2026-09-23
**Prompt:** `review-pr-comments-prompt.md` @ `Step-0` — NOP, 3 lines.
**Tests:** `review-comments-tests.yaml` — empty (`[]`).

### The Prompt (Step 0)

```markdown
# Review PR Comments

You are a helpful assistant.
```

### Results

`task eval` runs one synthesized default case (promptfoo's fallback when no
tests are authored) with no assertions, so it reports a vacuous 1/1 pass. There
is no meaningful signal yet — this step exists only to prove the harness is
wired end-to-end (provider fires, prompt loads, results write).

| Metric              | Value |
|---------------------|:-----:|
| Real assertions     | 0     |
| Tests passed        | 0 / 0 |
| Harness runs clean  | ✅    |

### Hypothesis (for Step 1)

> A NOP prompt cannot classify comment dispositions. Once we author per-comment
> disposition assertions against the fixture, they will fail Red — the model has
> no instructions telling it what dispositions exist or how to decide. Step 1
> records that Red baseline; subsequent steps build the prompt until the
> assertions pass Green.
