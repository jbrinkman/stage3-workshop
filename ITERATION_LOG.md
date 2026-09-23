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

Deterministic-heavy suite against the `math-app` fixture. Pass rate per metric,
by step. (Steps 1–2 ran 13 assertions; Step 3 added comment-8/9 → 17 assertions.)

| Metric                          | Type            | 🔴 Step 1 (Red) | 🟢 Step 2 (Green) | 🟢 Step 3 (Green) |
|---------------------------------|-----------------|:---------------:|:-----------------:|:-----------------:|
| has-disposition-block           | deterministic   | 0%              | 100%              | 100%              |
| all-ids-present                 | deterministic   | 0%              | 100%              | 100%              |
| no-extra-ids                    | deterministic   | 100%¹           | 100%              | 100%              |
| dispositions-valid-enum         | deterministic   | 0%              | 100%              | 100%              |
| comment-1-FIX                   | deterministic   | 0%              | 100%              | 100%              |
| comment-2-FIX                   | deterministic   | 0%              | 100%              | 100%              |
| comment-3-FIX                   | deterministic   | 0%              | 100%              | 100%              |
| comment-4-OPTIONAL              | deterministic   | 0%              | 100%              | 100%              |
| comment-5-OUT_OF_SCOPE          | deterministic   | 0%              | 100%              | 100%              |
| comment-6-REJECT                | deterministic   | 0%              | 100%              | 100%              |
| comment-7-DEPENDENT             | deterministic   | 0%              | 100%              | 100%              |
| comment-8-PARTIAL               | deterministic   | —               | —                 | ~83%²             |
| comment-9-REJECT (already-handled) | deterministic| —               | —                 | 100%              |
| comment-6-reason-correct        | rubric (gated)  | 0%              | 100%              | 100%              |
| comment-7-reason-dependency     | rubric (gated)  | 0%              | 100%              | 100%              |
| comment-8-reason-partial        | rubric (gated)  | —               | —                 | ~83%²             |
| comment-9-reason-already-handled | rubric (gated) | —               | —                 | 100%              |
| **Overall test case**           |                 | **❌ FAIL**     | **✅ PASS**       | **✅ PASS (typical)** |

**Step 1 → Step 2 delta: 12 of 13 metrics moved 0% → 100%; test case FAIL → PASS.**
Confirmed stable across 3 consecutive runs (all 13 metrics 100% each run).

**Step 3 delta (vs Step 2 Red for the two new criteria): `comment-8-PARTIAL` and
`comment-8-reason-partial` moved 0% → ~83%; `comment-9` (broadened REJECT) was
already 100%.** All 15 prior metrics held at 100% (no regression).

¹ `no-extra-ids` is a vacuous pass at Red: the NOP output parses zero comment
ids, so "no extra ids" is trivially true. It becomes load-bearing once the
prompt emits real ids.

² **Stability caveat (comment-8):** across 6 runs of the Step 3 prompt,
`comment-8-PARTIAL` passed 5/6 (~83%); the one miss classified comment-8 as
FIX/OUT_OF_SCOPE instead of PARTIAL. This is inherent task ambiguity — comment-8
(multiply/BigInt) sits on a genuine PARTIAL-vs-FIX-vs-OUT_OF_SCOPE boundary, so a
mid-tier model wavers. The deterministic parse is stable; the *judgment* varies.
The gated `comment-8-reason-partial` tracks it (passes only when the verdict is
PARTIAL). Best run: 17/17. Typical run: 16/17. The 0% → ~83% gain on PARTIAL is
the measured improvement for this round.

> Step 0 (prior): NOP prompt, empty suite — no real assertions. Superseded by
> Step 1, which adds the real deterministic-heavy eval suite and captures the
> Red baseline below.

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


---

## 🔴 Step 1 — Red: deterministic-heavy suite, NOP prompt fails

**Date:** 2026-09-23
**Prompt:** `review-pr-comments-prompt.md` — still a NOP ("You are a helpful
assistant.") that echoes the PR source and comments. No classification logic.
**Tests:** `review-comments-tests.yaml` — 11 deterministic + 2 gated rubric
assertions against fixture PR #1.

### The output contract under test (hybrid)

The skill must produce human-readable prose AND end with a machine-readable
block, one verdict per comment id. Verdict vocabulary:
`FIX · OPTIONAL · OUT_OF_SCOPE · REJECT · DEPENDENT`.

**Eval philosophy:** deterministic-heavy (~85%). `eval-review-comments.js` parses
the disposition block and checks structure + per-comment classification against
ground truth. The 2 rubrics grade only the prose *reasoning* quality that
parsing can't judge — and are **gated**: they score 0 unless the block parses
and carries the correct verdict, so reasoning is never credited without structure.

### Results — Red baseline

Overall: **0/1 test case (FAIL)**. 12 of 13 metrics at 0%; `no-extra-ids` is a
vacuous 100% (zero ids parsed → zero extras). See the cumulative table above.

### Root cause

The NOP prompt has no notion of the disposition vocabulary or the output block,
so it emits free-form prose. Every structural and classification check fails,
and the gated rubrics correctly refuse to credit reasoning with no valid block.

### Hypothesis (for Step 2)

> If the prompt (a) defines the 5-verdict vocabulary with decision criteria for
> each disposition, (b) instructs the model to address every comment id, and
> (c) specifies the trailing disposition block format, then the structural and
> classification checks flip Green and the gated reasoning rubrics become live.
> Step 2 writes that prompt and records the Green delta.


---

## 🟢 Step 2 — Green: structured skill prompt passes the suite

**Date:** 2026-09-23
**Prompt:** `review-pr-comments-prompt.md` — replaced the NOP with a structured
skill (~69 lines): senior-engineer role, the 5-verdict vocabulary with decision
criteria for each disposition, an instruction to address every comment id, and
the exact hybrid output contract (prose sections + a trailing `disposition`
block).
**Tests:** unchanged from Step 1 (same 13 assertions) — only the prompt changed,
so the delta is attributable to the prompt.

### What changed (Step 1 → Step 2)

| Section added to the prompt | Which metrics it drives |
|-----------------------------|-------------------------|
| Verdict vocabulary + per-disposition decision criteria | the 7 `comment-N` classification checks |
| "Read the code before judging; a false bug claim is REJECT" | `comment-6-REJECT` + `comment-6-reason-correct` |
| "Name the comment id(s) a DEPENDENT item waits on" | `comment-7-DEPENDENT` + `comment-7-reason-dependency` |
| Output contract: trailing ```disposition``` block, one `comment-N: VERDICT` per line | `has-disposition-block`, `all-ids-present`, `no-extra-ids`, `dispositions-valid-enum` |

The example block in the prompt uses generic placeholder verdicts (NOT the
fixture's answers), so the model must reason about the fixture rather than copy.

### Results — Green

Overall **1/1 PASS**; all 13 metrics 100%. Both gated reasoning rubrics are now
live (structure present) and passing. See the cumulative table above.

### Stability

Ran `task metrics` 3 consecutive times: every run scored 13/13 at 100% with the
test case PASS. The suite is deterministic-heavy (11 of 13 checks are pure
parse-and-compare), so run-to-run variance is minimal; the 2 gated rubrics also
held at 100% across all three runs.

### Reasoning

The NOP had no notion of the verdict vocabulary or output contract, so it failed
every structural and classification check (Step 1). Spelling out (a) the
dispositions and how to choose among them, (b) the requirement to address each
comment, and (c) the machine-readable block format was sufficient to flip the
entire suite Green in one change — the load-bearing content is the decision
criteria plus the output contract, nothing more.

### Next

Coverage is currently one fixture (PR #1). Future steps should add fixtures for
cases this prompt has not been tested against (clean PR with no real issues,
conflicting reviewers, already-addressed comments, non-JS source) to probe
where the prompt over- or under-classifies, then iterate.


---

## 🟢 Step 3 — Green: add PARTIAL disposition + broaden REJECT

**Date:** 2026-09-23
**Prompt:** `review-pr-comments-prompt.md` — added the **PARTIAL** disposition
("valid concern, wrong/overreaching fix") and broadened **REJECT** to cover
"already handled" and "conflicts with project conventions", with matching
decision guidance. Output-contract enum + example updated to include PARTIAL.
**Fixture:** `math-app` gained two comments — comment-8 (multiply/BigInt:
legitimate precision concern, overreaching remedy → PARTIAL) and comment-9
(calculate() default-throw already exists → REJECT/already-handled).
**Tests:** +4 assertions (comment-8/9 classification + 2 gated reasoning
rubrics), 13 → 17 total.

### Why this round (motivation)

Comparing our prompt to the `pr-comment-resolver` skill in ai-power-tools
surfaced two gaps in our disposition scheme: no notion of a *partially* valid
comment (valid concern, wrong fix), and a REJECT criterion narrower than the
resolver's (it also rejects "already handled" and "conflicts with conventions").
We kept our single action-oriented axis but imported those two ideas.

### Red → Green

- **Red** (criteria added, Step 2 prompt unchanged): `comment-8-PARTIAL` and
  `comment-8-reason-partial` failed 0% — the prompt had no PARTIAL concept.
  Notably `comment-9` (broadened REJECT / already-handled) *already* passed
  100%: the model read `calculate()`, saw the existing `default: throw`, and
  rejected correctly on its own. So the genuine gap was PARTIAL.
- **Green** (PARTIAL added, REJECT broadened): comment-8 metrics flip to ~83%
  (see caveat), comment-9 stays 100% — now load-bearing rather than incidental —
  and all 15 prior metrics hold at 100% (no regression).

### Stability

Ran `task metrics` 6 times. 16 of 17 metrics were 100% every run. The exception
is `comment-8-PARTIAL` (and its gated reasoning rubric), which passed 5/6 (~83%):
the one miss classified comment-8 as FIX/OUT_OF_SCOPE instead of PARTIAL.

This is **inherent task ambiguity, not a harness defect.** comment-8 sits on a
genuine boundary between PARTIAL (valid concern, wrong fix), FIX (just fix it),
and OUT_OF_SCOPE (arbitrary precision is a bigger feature). A mid-tier model
wavers on that judgment call. The deterministic parse is fully stable; only the
classification *judgment* varies. Recorded honestly rather than rigging the
fixture to force determinism where the task is genuinely judgment-based.

### Reasoning

The measured improvement is `comment-8-PARTIAL` 0% → ~83% from a single prompt
change (adding the disposition + guidance). The already-handled REJECT case was
within the model's reach without prompt help, but the explicit guidance makes it
load-bearing. The residual ~17% miss on comment-8 is the natural next target —
either sharper PARTIAL-vs-FIX guidance or additional PARTIAL fixtures to pin the
boundary.
