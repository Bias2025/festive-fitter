#!/usr/bin/env node
/**
 * Generates a roster of diverse, photoreal base-model images with a
 * text-to-image model on Replicate, then writes scripts/models.json so
 * scripts/generate-previews.mjs can dress them.
 *
 *   npm run models                 # create any roster members missing a photo
 *   npm run models -- --force      # regenerate all of them
 *   npm run models -- --model black-forest-labs/flux-1.1-pro
 *
 * Setup: put REPLICATE_API_TOKEN in .env.local (same token the app uses).
 *
 * Output: scripts/models/<id>.png  +  scripts/models.json
 * Then:   npm run previews
 *
 * The roster below is a starting point — edit ROSTER to taste. Each member is
 * rendered facing the camera in plain grey clothing on a seamless studio
 * backdrop so the try-on step has a clean base to work from.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODELS_DIR = join(ROOT, 'scripts', 'models');

// id, a human label (kept in models.json), and the descriptive bits that go
// into the generation prompt. Spread across skin tone, age, body type, gender.
const ROSTER = [
  { id: 'm1', desc: 'a woman in her 30s with deep brown skin, a curvy build, and long black box braids' },
  { id: 'm2', desc: 'a man in his 20s with light skin, a slim build, and short wavy brown hair' },
  { id: 'm3', desc: 'a woman in her 40s with medium-deep brown skin, a mid-size build, and a short natural afro' },
  { id: 'm4', desc: 'a man in his 50s with medium olive skin, a fuller build, a grey beard, and short grey hair' },
  { id: 'm5', desc: 'a woman in her 20s with light-medium skin, a mid-size build, and long straight dark hair' },
  { id: 'm6', desc: 'a teenage boy with deep brown skin, a slim build, and short cropped black hair' },
  { id: 'm7', desc: 'a nonbinary person in their 30s with medium tan skin, an athletic build, and a shaved head' },
  { id: 'm8', desc: 'a woman in her 60s with fair skin, a petite build, and shoulder-length silver hair' }
];

function loadToken() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  const p = join(ROOT, '.env.local');
  if (existsSync(p)) {
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*REPLICATE_API_TOKEN\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

async function txt2img(token, modelId, desc) {
  const prompt =
    `full-body studio photograph of ${desc}, standing and facing the camera, ` +
    `relaxed neutral pose with arms at their sides, wearing a plain fitted light-grey t-shirt and plain grey shorts, ` +
    `plain seamless pale-grey studio background, soft even lighting, sharp focus, natural skin texture, photorealistic, no text`;

  const res = await fetch(`https://api.replicate.com/v1/models/${modelId}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait' },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: '3:4',
        output_format: 'png',
        num_outputs: 1,
        disable_safety_checker: false
      }
    })
  });
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${await res.text()}`);

  let pred = await res.json();
  let tries = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && tries < 40) {
    await new Promise((r) => setTimeout(r, 2000));
    pred = await (await fetch(pred.urls.get, { headers: { Authorization: `Bearer ${token}` } })).json();
    tries++;
  }
  if (pred.status !== 'succeeded') throw new Error(`generation ${pred.status}`);
  const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  const img = await fetch(url);
  if (!img.ok) throw new Error(`download failed: ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes('--force');
  const mi = argv.indexOf('--model');
  const modelId = mi >= 0 ? argv[mi + 1] : 'black-forest-labs/flux-1.1-pro';

  const token = loadToken();
  if (!token) {
    console.error('Missing REPLICATE_API_TOKEN (env or .env.local).');
    process.exit(1);
  }
  mkdirSync(MODELS_DIR, { recursive: true });

  const modelsJsonPath = join(ROOT, 'scripts', 'models.json');
  const prev = existsSync(modelsJsonPath) ? JSON.parse(readFileSync(modelsJsonPath, 'utf8')) : {};
  const overrides = prev.overrides || {};

  console.log(`Generating base models with ${modelId}...\n`);
  const entries = [];
  for (const member of ROSTER) {
    const rel = `scripts/models/${member.id}.png`;
    const abs = join(MODELS_DIR, `${member.id}.png`);
    if (!force && existsSync(abs)) {
      console.log(`  · ${member.id}  (exists, skipping)`);
      entries.push({ id: member.id, label: member.desc, photo: rel });
      continue;
    }
    try {
      const png = await txt2img(token, modelId, member.desc);
      writeFileSync(abs, png);
      entries.push({ id: member.id, label: member.desc, photo: rel });
      console.log(`  ✓ ${member.id}  ${member.desc}`);
    } catch (err) {
      console.log(`  ✗ ${member.id}  — ${err.message}`);
    }
  }

  writeFileSync(modelsJsonPath, JSON.stringify({ models: entries, overrides }, null, 2) + '\n');
  console.log(`\nWrote scripts/models.json with ${entries.length} model(s). Next: npm run previews`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
