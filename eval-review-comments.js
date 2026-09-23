// eval-review-comments.js
// Deterministic assertion functions for the review-pr-comments skill.
//
// HYBRID output contract: the skill writes human-readable prose addressing each
// comment, then ends with a machine-readable fenced block:
//
//   ```disposition
//   comment-1: FIX
//   comment-2: FIX
//   ...
//   comment-7: DEPENDENT
//   ```
//
// verdict ∈ FIX | OPTIONAL | OUT_OF_SCOPE | REJECT | DEPENDENT
//
// These functions parse the summary block and check structure + per-comment
// classification deterministically. Rubric assertions cover only the prose
// reasoning quality that parsing can't judge.

const VALID_DISPOSITIONS = ['FIX', 'OPTIONAL', 'OUT_OF_SCOPE', 'REJECT', 'DEPENDENT'];

// Ground-truth expected disposition per comment id for fixture PR #1.
const EXPECTED = {
  'comment-1': 'FIX', // divide-by-zero — real defect
  'comment-2': 'FIX', // power() negative/fractional exponents — real defect
  'comment-3': 'FIX', // CLI prints NaN, no input validation — real defect
  'comment-4': 'OPTIONAL', // arrow-fn style nit, non-blocking
  'comment-5': 'OUT_OF_SCOPE', // add a REST API / Express server
  'comment-6': 'REJECT', // subtract operand order claim is incorrect
  'comment-7': 'DEPENDENT', // regression tests depend on comment-1/comment-2
};

const COMMENT_IDS = Object.keys(EXPECTED);

/**
 * Extract the disposition map from a model output string.
 * Looks for a fenced ```disposition ... ``` block first; if absent, falls back
 * to scanning the whole output for `comment-N: VERDICT` lines.
 * Returns an object { "comment-1": "FIX", ... } (verdicts upper-cased), or {}.
 */
function parseDispositions(output) {
  if (typeof output !== 'string') return {};

  // Prefer the dedicated fenced block.
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

function hasAllCommentIds(output) {
  const map = parseDispositions(output);
  const missing = COMMENT_IDS.filter((id) => !(id in map));
  return result(missing.length === 0,
    missing.length ? `Missing verdicts for: ${missing.join(', ')}` :
      'All 7 comment verdicts present');
}

function noExtraCommentIds(output) {
  const map = parseDispositions(output);
  const extra = Object.keys(map).filter((k) => !COMMENT_IDS.includes(k));
  return result(extra.length === 0,
    extra.length ? `Unexpected comment ids: ${extra.join(', ')}` : 'No extra comment ids');
}

function allDispositionsValid(output) {
  const map = parseDispositions(output);
  if (Object.keys(map).length === 0) return result(false, 'No verdicts parsed');
  const bad = [];
  for (const id of COMMENT_IDS) {
    if (!VALID_DISPOSITIONS.includes(map[id])) bad.push(`${id}=${map[id] || 'missing'}`);
  }
  return result(bad.length === 0,
    bad.length ? `Invalid/missing verdicts: ${bad.join(', ')}` :
      'All verdicts are valid enum values');
}

// --- Per-comment classification (deterministic) ------------------------
function makeClassificationCheck(id) {
  return function (output) {
    const map = parseDispositions(output);
    const got = map[id];
    const want = EXPECTED[id];
    return result(got === want,
      got === want ? `${id} correctly classified as ${want}` :
        `${id}: expected ${want}, got ${got || 'missing'}`);
  };
}

module.exports = {
  // structural
  hasDispositionBlock,
  hasAllCommentIds,
  noExtraCommentIds,
  allDispositionsValid,
  // per-comment classification
  classifyComment1: makeClassificationCheck('comment-1'),
  classifyComment2: makeClassificationCheck('comment-2'),
  classifyComment3: makeClassificationCheck('comment-3'),
  classifyComment4: makeClassificationCheck('comment-4'),
  classifyComment5: makeClassificationCheck('comment-5'),
  classifyComment6: makeClassificationCheck('comment-6'),
  classifyComment7: makeClassificationCheck('comment-7'),
  // exported for reuse/testing
  parseDispositions,
  EXPECTED,
  VALID_DISPOSITIONS,
};
