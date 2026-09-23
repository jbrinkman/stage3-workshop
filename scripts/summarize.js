#!/usr/bin/env node
// summarize.js — distill a promptfoo JSON output file into a compact metrics
// table for ITERATION_LOG.md. Usage: node scripts/summarize.js <results.json>
//
// Prints:
//   - overall pass/fail counts and pass rate
//   - per-named-metric pass rate (uses the `metric:` label on each assertion)
//   - per-test-case pass/fail (by description)
// so you can paste the numbers straight into the iteration log's tables.

const fs = require('fs');

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/summarize.js <results.json>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
// promptfoo nests the payload under `results` (with a `.results` array + `.stats`).
const root = raw.results || raw;
const rows = root.results || [];
const stats = root.stats || {};

// --- Overall ------------------------------------------------------------
const passed = stats.successes ?? rows.filter((r) => r.success).length;
const failed = stats.failures ?? rows.filter((r) => !r.success).length;
const errors = stats.errors ?? 0;
const total = passed + failed;
const pct = total ? Math.round((passed / total) * 100) : 0;

// --- Per-named-metric ---------------------------------------------------
// Aggregate componentResults by their assertion `metric` label.
const metricAgg = {}; // metric -> { pass, total }
for (const r of rows) {
  const comps = r.gradingResult?.componentResults || [];
  for (const c of comps) {
    const metric = c.assertion?.metric;
    if (!metric) continue;
    metricAgg[metric] ??= { pass: 0, total: 0 };
    metricAgg[metric].total += 1;
    if (c.pass) metricAgg[metric].pass += 1;
  }
}

// --- Per-test-case ------------------------------------------------------
const cases = rows.map((r) => ({
  desc: r.description || r.testCase?.description || r.vars?.description || '(no description)',
  pass: !!r.success,
}));

// --- Output -------------------------------------------------------------
console.log('\n===== METRICS SUMMARY (paste into ITERATION_LOG.md) =====\n');

console.log(`Overall: ${passed}/${total} passed (${pct}%)` +
  (errors ? `  [${errors} errors]` : ''));

const metricNames = Object.keys(metricAgg).sort();
if (metricNames.length) {
  console.log('\nPer-metric pass rate:');
  console.log('| Metric | Pass rate |');
  console.log('|--------|:---------:|');
  for (const m of metricNames) {
    const { pass, total: t } = metricAgg[m];
    console.log(`| ${m} | ${Math.round((pass / t) * 100)}% (${pass}/${t}) |`);
  }
}

if (cases.length) {
  console.log('\nPer-test-case:');
  console.log('| Test case | Result |');
  console.log('|-----------|:------:|');
  for (const c of cases) {
    console.log(`| ${c.desc} | ${c.pass ? '✅ PASS' : '❌ FAIL'} |`);
  }
}

console.log('');
