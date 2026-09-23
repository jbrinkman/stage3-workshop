# Pull Request Review Comments

**PR #1 — Add core arithmetic operations and CLI calculator**

Source under review lives in `fixture/source/` (`operations.js`, `calculator.js`, `operations.test.js`).

Below are the review comments left on this PR. Each has an id so tests can assert
how the skill decides to handle it.

---

### comment-1
**File:** `operations.js`  **Line:** 39 (`divide`)
**Reviewer:** alice

> `divide` doesn't guard against division by zero. `divide(10, 0)` returns
> `Infinity` and `divide(0, 0)` returns `NaN`. We should decide on and document
> the intended behavior — most likely throw an error on a zero divisor.

---

### comment-2
**File:** `operations.js`  **Line:** 41 (`power`)
**Reviewer:** bob

> The `power` implementation only works for non-negative integer exponents.
> `power(2, -1)` returns `1` and `power(2, 0.5)` returns `1`, both wrong.
> Consider using `Math.pow` instead of the manual loop.

---

### comment-3
**File:** `calculator.js`  **Line:** 20 (`main`)
**Reviewer:** carol

> `parseFloat` on a missing or non-numeric argument yields `NaN`, and the CLI
> then prints `NaN` with no explanation. We should validate the parsed operands
> and exit with a clear error message.

---

### comment-4
**File:** `operations.js`  **Line:** 7 (`add`)
**Reviewer:** dave

> Nit: I'd prefer arrow functions here (`const add = (a, b) => a + b`) instead
> of function declarations, just for consistency with how we write utilities
> elsewhere. Not blocking.

---

### comment-5
**File:** `calculator.js`  **Line:** 12
**Reviewer:** erin

> While we're in here, could we add a REST API around these operations and
> wire up an Express server? Would be great to expose the calculator over HTTP.

---

### comment-6
**File:** `operations.js`  **Line:** 15 (`subtract`)
**Reviewer:** frank

> This `subtract` function looks like it will return the wrong sign — shouldn't
> `subtract(5, 2)` give `-3`? I think the operand order is backwards.

---

### comment-7
**File:** `operations.test.js`  **Line:** 12
**Reviewer:** grace

> The test file has no assertions for `divide` by zero or for `power` with
> negative/fractional exponents. Given the bugs above, we should add regression
> tests once those are fixed.
