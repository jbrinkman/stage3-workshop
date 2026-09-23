# Pull Request Review Comments

**PR #2 — Add string utility helpers (`stringutils.js`)**

Source under review lives in `fixtures/text-utils/source/`.

Review comments left on this PR, each with an id so tests can assert the
skill's disposition.

---

### comment-1
**File:** `stringutils.js`  **Line:** 8 (`truncate`)
**Reviewer:** alice

> `truncate` mishandles small budgets. `truncate("hi", 0)` calls
> `slice(0, -1)` (because `maxLen - 1` is `-1`), which returns `"h"` and then
> appends the ellipsis, yielding `"h…"` — two characters for a budget of zero.
> Negative/zero `maxLen` isn't guarded.

---

### comment-2
**File:** `stringutils.js`  **Line:** 18 (`slugify`)
**Reviewer:** bob

> `slugify` strips all non-ASCII, so `"Café Münchén"` becomes `"caf-mnchn"`.
> We should normalize accented characters (NFKD + strip diacritics) before the
> replace so real names slugify sensibly.

---

### comment-3
**File:** `stringutils.js`  **Line:** 28 (`wordCount`)
**Reviewer:** carol

> `wordCount("")` will throw because `"".split(/\s+/)` returns `[""]` and then
> you read `.length` on undefined. This needs an empty-string guard.

---

### comment-4
**File:** `stringutils.js`  **Line:** 36 (`titleCase`)
**Reviewer:** dave

> `titleCase` mishandles apostrophes — `titleCase("o'brien")` gives `"O'Brien"`
> which is actually fine, but `titleCase("mcdonald")` won't fix internal caps.
> That edge case is worth handling. The fix I'm proposing, though, is to replace
> the whole thing with a full Intl-based, locale-aware title-casing library that
> also handles small words ("of", "the") — which is a lot for this one helper.

---

### comment-5
**File:** `stringutils.js`  **Line:** 43 (`repeatJoin`)
**Reviewer:** erin

> While we're here, `repeatJoin` should be rebuilt as a streaming generator
> module with backpressure so it can handle `n` in the billions without
> allocating the array. Can we add that whole streaming layer in this PR?

---

### comment-6
**File:** `stringutils.js`  **Line:** 6 (`truncate`)
**Reviewer:** frank

> Nit: I'd write these as `const truncate = (str, maxLen) => {…}` arrow
> functions to match my personal preference. Non-blocking.

---

### comment-7
**File:** `stringutils.test.js`  **Line:** 8
**Reviewer:** grace

> There are no tests for the `truncate` small-budget behavior raised above. We
> should add them once that edge case is fixed.

---

### comment-8
**File:** `stringutils.js`  **Line:** 8 (`truncate`)
**Reviewer:** heidi

> These functions crash on `null`/`undefined` input, which the service passes
> through from optional API fields. `truncate(null, 5)` throws
> `TypeError: Cannot read properties of null (reading 'length')` in production
> today. This is a real defect — guard the inputs and throw a clear, intentional
> TypeError (or coerce), rather than crashing on a property read.
