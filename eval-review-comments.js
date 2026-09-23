// eval-review-comments.js
// Deterministic assertion functions for the review-pr-comments skill.
//
// HYBRID output contract: the skill writes human-readable prose addressing each
// comment, then ends with a machine-readable fenced block:
//
//   ```disposition
//   comment-1: FIX
//   comment-2: PARTIAL
//   ...
//   ```
//
// verdict ∈ FIX | PARTIAL | OPTIONAL | OUT_OF_SCOPE | REJECT | DEPENDENT
//
// PER-FIXTURE GROUND TRUTH: each test case passes its own expected map through
// `vars.expected` ({ "comment-1": "FIX", ... }). promptfoo calls JS assertions
// as fn(output, context); we read context.vars.expected so one eval script
// serves any number of fixtures without hardcoding a single fixture's answers.

const VALID_DISPOSITIONS = ['FIX', 'PARTIAL', 'OPTIONAL', 'OUT_OF_SCOPE', 'REJECT', 'DEPENDENT'];

/**
 * Read the expected {commentId: VERDICT} map for this test case from vars.
 * The map is supplied per-fixture in the test's `vars.expected`.
 */
function expectedMap(context) {
  const e = context && context.vars && context.vars.expected;
  return e && typeof e === 'object' ? e : {};
}

/**
 * Extract the disposition map from a model output string.
 * Prefers a fenced ```disposition ... ``` block; falls back to scanning the
 * whole output for `comment-N: VERDICT` lines. Verdicts are upper-cased.
 */
function parseDispositions(output) {
  if (typeof output !== 'string') return {};
  const block = output.match(/```(?:disposition[s]?)?\s*([\s\S]*?)```/i);
  const text = block ? block[1] : output;
  const map = {};
  const lineRe = /(comment-\d+)\s*[:\-–]\s*([A-Za-z_]+)/g;
  let m;
  while ((m = lineRe.exec(text)) !== null) {
    map[m[1].toLowerCase()] = m[2].toUpperCase();
  }
  return map;
}

function result(pass, reason) {
  return { pass, score: pass ? 1 : 0, reason };
}

// --- Structural (deterministic) ----------------------------------------

function hasDispositionBlock(output) {
  const hasFence = /```(?:disposition[s]?)?\s*[\s\S]*?comment-\d+\s*[:\-–]\s*[A-Za-z_]+[\s\S]*?```/i.test(output || '');
  return result(hasFence,
    hasFence ? 'Output contains a machine-readable disposition block' :
      'No fenced disposition block with comment verdicts found');
}

function hasAllCommentIds(output, context) {
  const ids = Object.keys(expectedMap(context));
  const map = parseDispositions(output);
  const missing = ids.filter((id) => !(id in map));
  return result(missing.length === 0,
    missing.length ? `Missing verdicts for: ${missing.join(', ')}` :
      `All ${ids.length} comment verdicts present`);
}

function noExtraCommentIds(output, context) {
  const ids = Object.keys(expectedMap(context));
  const map = parseDispositions(output);
  const extra = Object.keys(map).filter((k) => !ids.includes(k));
  return result(extra.length === 0,
    extra.length ? `Unexpected comment ids: ${extra.join(', ')}` : 'No extra comment ids');
}

function allDispositionsValid(output, context) {
  const ids = Object.keys(expectedMap(context));
  const map = parseDispositions(output);
  if (Object.keys(map).length === 0) return result(false, 'No verdicts parsed');
  const bad = [];
  for (const id of ids) {
    if (!VALID_DISPOSITIONS.includes(map[id])) bad.push(`${id}=${map[id] || 'missing'}`);
  }
  return result(bad.length === 0,
    bad.length ? `Invalid/missing verdicts: ${bad.join(', ')}` :
      'All verdicts are valid enum values');
}

// --- Per-comment classification (deterministic) ------------------------
// One check per comment id, reading the expected verdict from vars.expected.
function makeClassificationCheck(id) {
  return function (output, context) {
    const want = expectedMap(context)[id];
    const got = parseDispositions(output)[id];
    return result(got === want,
      got === want ? `${id} correctly classified as ${want}` :
        `${id}: expected ${want}, got ${got || 'missing'}`);
  };
}

const classificationChecks = {};
for (let i = 1; i <= 12; i++) {
  classificationChecks[`classifyComment${i}`] = makeClassificationCheck(`comment-${i}`);
}

module.exports = {
  // structural
  hasDispositionBlock,
  hasAllCommentIds,
  noExtraCommentIds,
  allDispositionsValid,
  // per-comment classification (comment-1 .. comment-12)
  ...classificationChecks,
  // exported for reuse/testing
  parseDispositions,
  expectedMap,
  VALID_DISPOSITIONS,
};
