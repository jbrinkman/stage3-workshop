#!/usr/bin/env node
// ablate.js — load-bearing analysis for the review-pr-comments prompt.
//
// For each `<!-- ablate:NAME -->…<!-- /ablate:NAME -->` section in the prompt,
// produce a variant with that section removed, run the eval suite N times, and
// compare the mean pass rate against the un-ablated baseline. A section whose
// removal drops the score is LOAD-BEARING; one whose removal changes nothing is
// a CRUFT candidate.
//
// Usage: node scripts/ablate.js [runsPerVariant=3]
//
// Writes temp prompt + config under tmp/ablate/ and cleans them up. Prints a
// markdown summary table.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROMPT = path.join(ROOT, 'review-pr-comments-prompt.md');
const CONFIG = path.join(ROOT, 'promptfooconfig.yaml');
const TMP = path.join(ROOT, 'tmp', 'ablate');
const RUNS = parseInt(process.argv[2] || '3', 10);

const promptSrc = fs.readFileSync(PROMPT, 'utf8');
const baseConfig = fs.readFileSync(CONFIG, 'utf8');

// Discover ablation section names.
const sectionNames = [...promptSrc.matchAll(/<!--\s*ablate:([\w-]+)\s*-->/g)].map((m) => m[1]);

function stripSection(src, name) {
  const re = new RegExp(
    `<!--\\s*ablate:${name}\\s*-->[\\s\\S]*?<!--\\s*/ablate:${name}\\s*-->\\n?`,
    'g'
  );
  return src.replace(re, '');
}

// Run the suite against a given prompt file; return overall pass count + total.
function runSuite(promptFileAbs, label) {
  const cfgPath = path.join(TMP, `config-${label}.yaml`);
  const outPath = path.join(TMP, `out-${label}.json`);
  // Rewrite the prompts: line in a copy of the real config to point at the variant.
  const cfg = baseConfig.replace(
    /prompts:\s*\n\s*-\s*["']?[^"'\n]+["']?/,
    `prompts:\n  - "file://${promptFileAbs}"`
  );
  fs.writeFileSync(cfgPath, cfg);
  let passes = 0;
  let total = 0;
  for (let i = 0; i < RUNS; i++) {
    try {
      execSync(
        `npx promptfoo eval --no-cache --config "${cfgPath}" --output "${outPath}"`,
        { cwd: ROOT, stdio: 'ignore' }
      );
    } catch (_) {
      /* non-zero exit on test failure is expected */
    }
    const r = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    const root = r.results || r;
    const rows = root.results || [];
    for (const row of rows) {
      total += 1;
      if (row.success) passes += 1;
    }
  }
  return { passes, total, rate: total ? passes / total : 0 };
}

function main() {
  fs.mkdirSync(TMP, { recursive: true });
  console.log(`Ablation analysis — ${RUNS} run(s) per variant, ${sectionNames.length} sections\n`);

  // Baseline: full prompt (markers are inert HTML comments).
  const basePromptFile = path.join(TMP, 'prompt-baseline.md');
  fs.writeFileSync(basePromptFile, promptSrc);
  const baseline = runSuite(basePromptFile, 'baseline');
  console.log(`Baseline (full prompt): ${baseline.passes}/${baseline.total} test-case passes (${Math.round(baseline.rate * 100)}%)\n`);

  const results = [];
  for (const name of sectionNames) {
    const variant = stripSection(promptSrc, name);
    const vFile = path.join(TMP, `prompt-no-${name}.md`);
    fs.writeFileSync(vFile, variant);
    const r = runSuite(vFile, `no-${name}`);
    const delta = r.rate - baseline.rate;
    results.push({ name, ...r, delta });
    console.log(`  - removed ${name.padEnd(16)} -> ${r.passes}/${r.total} (${Math.round(r.rate * 100)}%)  Δ ${(delta * 100).toFixed(0)}pp`);
  }

  console.log('\n===== LOAD-BEARING SUMMARY =====\n');
  console.log('| Section | Baseline | Ablated | Δ | Verdict |');
  console.log('|---------|:--------:|:-------:|:--:|---------|');
  for (const r of results.sort((a, b) => a.delta - b.delta)) {
    const verdict = r.delta < -0.001 ? '**LOAD-BEARING**' : 'cruft candidate';
    console.log(`| ${r.name} | ${Math.round(baseline.rate * 100)}% | ${Math.round(r.rate * 100)}% | ${(r.delta * 100).toFixed(0)}pp | ${verdict} |`);
  }

  // Cleanup temp variants/configs (keep nothing).
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('\n(cruft candidate = removing it did not lower the score across the runs; confirm with more runs before trimming.)');
}

main();
