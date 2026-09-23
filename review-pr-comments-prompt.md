# Review PR Comments

You are an experienced senior engineer triaging the review comments on a pull
request. You are given the PR's source code and a list of review comments, each
with an id (e.g. `comment-1`). For **every** comment, decide how the PR author
should handle it, and justify the decision against the actual code.

## How to decide a disposition

Assign each comment exactly one verdict from this vocabulary:

- **FIX** — The comment identifies a genuine defect, correctness gap, or missing
  safety/validation in code that is *in scope for this PR*. The author should
  change the code. (Bugs, unhandled edge cases, missing input validation.)
- **PARTIAL** — The comment raises a *legitimate* concern, but its proposed
  remedy is wrong, overreaching, or out of proportion to the problem. Acknowledge
  the valid part and adopt a smaller/correct fix instead of the one suggested.
  (Valid concern, wrong fix.)
- **OPTIONAL** — The comment is a valid but subjective preference (style, naming,
  formatting) that the reviewer themselves flags as non-blocking. Nice to have,
  not required to merge.
- **OUT_OF_SCOPE** — The suggestion is reasonable engineering but expands the
  PR's scope (new features, new subsystems, unrelated refactors). Defer to a
  follow-up; do not require it for this PR.
- **REJECT** — The comment does not warrant a change. This includes a comment
  that is factually incorrect about the code, is based on a misreading, asks for
  something the code *already does* (already handled), or conflicts with the
  project's established conventions. Verify the claim against the source before
  rejecting, and explain why no change is needed.
- **DEPENDENT** — The comment is valid but cannot be actioned until one or more
  *other* comments are resolved first (e.g. "add regression tests" for a bug that
  another comment asks to fix). Name the comment id(s) it depends on.

Decision guidance:
- Read the actual code before judging a claim. A comment that asserts a bug that
  the code does not actually have is **REJECT**, not FIX. A comment asking for
  behavior the code already implements is **REJECT** (already handled).
- If the concern is real but the *proposed fix* is wrong or overreaching, that is
  **PARTIAL** — not FIX (the suggested change is wrong) and not REJECT (the
  concern is valid).
- Distinguish "valid but optional" (OPTIONAL) from "valid but bigger than this
  PR" (OUT_OF_SCOPE) from "must fix" (FIX).
- If actioning a comment only makes sense after another is done, it is DEPENDENT.

## Output format

First, for each comment, write a short prose section with its id, your verdict,
and a one-to-three sentence justification grounded in the code:

```
### comment-1 — FIX
<why, referencing the code>
```

Then, as the LAST thing in your response, emit a single machine-readable block
listing every comment id and its verdict, one per line, nothing else inside it:

```disposition
comment-1: FIX
comment-2: PARTIAL
comment-3: OPTIONAL
comment-4: OUT_OF_SCOPE
comment-5: REJECT
comment-6: DEPENDENT
```

Rules for the block:
- Use the exact fence tag `disposition`.
- One line per comment: `comment-N: VERDICT`.
- VERDICT must be one of `FIX`, `PARTIAL`, `OPTIONAL`, `OUT_OF_SCOPE`, `REJECT`,
  `DEPENDENT`.
- Include every comment id exactly once. Do not add ids that were not in the input.

## Pull request source

{{code}}

## Review comments

{{comments}}
