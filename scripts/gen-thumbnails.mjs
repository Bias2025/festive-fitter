#!/usr/bin/env node
/**
 * Generates the placeholder rack thumbnails in /public/outfits/*.svg as
 * stylized "on a person" figures. Skin tone, hair and body shape rotate across
 * the catalog so the rack reads as diverse before the photoreal previews
 * (scripts/generate-previews.mjs) are generated.
 *
 *   node scripts/gen-thumbnails.mjs
 *
 * These are deliberately illustrative. Replace individual files with real
 * flat-lay or on-model photos any time; the app just needs the same filename.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'outfits');
mkdirSync(OUT, { recursive: true });

const SKIN = ['#F4D2B4', '#E7B58C', '#D69A6A', '#B87A4B', '#8D5A34', '#5E3A22'];
const HAIR = ['#1E140C', '#3A2413', '#0C0C0C', '#6B3B1E', '#9A9A9A', '#C9A15A', '#4A2C12'];

// Per-item render hints. Keys must match the ids in lib/outfits.ts.
const H = {
  // Halloween
  witch:        { bg: '#241733', garment: '#14121A', accent: '#7A46B0', pattern: 'plain', hat: 'witch' },
  vampire:      { bg: '#340B10', garment: '#0E0E12', accent: '#B01E2E', pattern: 'cape' },
  skeleton:     { bg: '#14161A', garment: '#17191D', accent: '#ECECEC', pattern: 'bones' },
  pumpkin:      { bg: '#43260C', garment: '#D9622B', accent: '#1B4332', pattern: 'plain' },
  ghost:        { bg: '#2C3038', garment: '#F2F0EA', accent: '#C9C6BC', pattern: 'plain' },
  devil:        { bg: '#340B10', garment: '#B01E2E', accent: '#6E0F16', pattern: 'cape', hat: 'horns' },
  'cat-ears':   { bg: '#1B1B1B', garment: '#141414', accent: '#3F3F3F', pattern: 'plain', hat: 'cat' },
  // Christmas · costumes
  santa:        { bg: '#7A1418', garment: '#C1272D', accent: '#F4EFE4', pattern: 'fur', hat: 'santa' },
  'mrs-claus':  { bg: '#7A1418', garment: '#C1272D', accent: '#F4EFE4', pattern: 'fur', long: true },
  elf:          { bg: '#123C29', garment: '#1B7A47', accent: '#C1272D', pattern: 'stripe', legwear: '#C1272D', hat: 'elf' },
  nutcracker:   { bg: '#0F1A38', garment: '#16255E', accent: '#C9A227', pattern: 'buttons', hat: 'nutcracker' },
  gingerbread:  { bg: '#402913', garment: '#7A4A24', accent: '#F4EFE4', pattern: 'icing' },
  // Christmas · sweaters
  sweater:              { bg: '#5A1E1E', garment: '#E8DFC8', accent: '#7A2E2E', pattern: 'fairisle' },
  'cream-sweater-dress':{ bg: '#6B5B47', garment: '#ECE3D2', accent: '#D6C7AC', pattern: 'ribbed', long: true },
  'camel-knit':         { bg: '#463621', garment: '#BB8B5C', accent: '#996E42', pattern: 'cable' },
  'green-cable-knit':   { bg: '#123C29', garment: '#1F5A3A', accent: '#0E3324', pattern: 'cable' },
  'burgundy-henley':    { bg: '#3A1520', garment: '#6E2439', accent: '#4A1526', pattern: 'waffle' },
  // Christmas · dresses
  'green-velvet-dress':   { bg: '#0F2E22', garment: '#12513A', accent: '#0C3D2C', pattern: 'plain', long: true },
  'burgundy-sequin-dress':{ bg: '#2E0F1C', garment: '#6E2439', accent: '#A83B5A', pattern: 'sequin', long: true },
  'cream-lace-midi':      { bg: '#6B5B47', garment: '#ECE3D2', accent: '#D6C7AC', pattern: 'lace', long: true },
  'tartan-dress':         { bg: '#5A1E1E', garment: '#A52A2A', accent: '#1B4332', pattern: 'plaid', long: true },
  // Christmas · pyjamas
  'pj-red-plaid':         { bg: '#5A1113', garment: '#8A1C1C', accent: '#161616', pattern: 'plaid', legwear: '#8A1C1C' },
  'pj-fairisle':          { bg: '#2F4B3F', garment: '#E8DFC8', accent: '#2F4B3F', pattern: 'fairisle', legwear: '#E8DFC8' },
  'pj-reindeer-onesie':   { bg: '#4A3721', garment: '#BB8B5C', accent: '#6B4226', pattern: 'plain', legwear: '#BB8B5C', hat: 'antlers' },
  'pj-santa-lounge':      { bg: '#7A1418', garment: '#C1272D', accent: '#F4EFE4', pattern: 'fur', legwear: '#C1272D' },
  'pj-tartan-nightdress': { bg: '#123C29', garment: '#1B4332', accent: '#0F1A38', pattern: 'plaid', long: true },
  'pj-family-plaid':      { bg: '#5A1113', garment: '#8A1C1C', accent: '#161616', pattern: 'plaid', legwear: '#8A1C1C' },
  'pj-white-waffle':      { bg: '#6B6459', garment: '#ECE9E1', accent: '#D4CDBE', pattern: 'waffle', legwear: '#ECE9E1' },
  // Christmas · accessories
  'santa-hat':             { bg: '#7A1418', garment: '#6E6E6E', accent: '#F4EFE4', pattern: 'plain', hat: 'santa' },
  'fairisle-beanie-scarf': { bg: '#5A1E1E', garment: '#6E6E6E', accent: '#E8DFC8', pattern: 'plain', hat: 'beanie', scarf: 'knit' },
  'plaid-scarf':           { bg: '#5A1E1E', garment: '#6E6E6E', accent: '#1B4332', pattern: 'plain', scarf: 'plaid' }
};

const LABELS = {
  witch: 'Witch Cloak', vampire: 'Vampire Cape', skeleton: 'Skeleton Suit', pumpkin: 'Pumpkin Costume',
  ghost: 'Ghost Sheet', devil: 'Devil Costume', 'cat-ears': 'Cat Ears & Tail',
  santa: 'Santa Suit', 'mrs-claus': 'Mrs. Claus Dress', elf: 'Elf Outfit', nutcracker: 'Nutcracker Uniform',
  gingerbread: 'Gingerbread Costume', sweater: 'Fair Isle Sweater', 'cream-sweater-dress': 'Cream Sweater Dress',
  'camel-knit': 'Camel Chunky Knit', 'green-cable-knit': 'Green Cable-Knit', 'burgundy-henley': 'Burgundy Waffle Henley',
  'green-velvet-dress': 'Emerald Velvet Dress', 'burgundy-sequin-dress': 'Burgundy Sequin Dress',
  'cream-lace-midi': 'Cream Lace Midi', 'tartan-dress': 'Red Tartan Dress',
  'pj-red-plaid': 'Red Plaid Pyjamas', 'pj-fairisle': 'Fair Isle Pyjama Set', 'pj-reindeer-onesie': 'Reindeer Onesie',
  'pj-santa-lounge': 'Santa Lounge Set', 'pj-tartan-nightdress': 'Tartan Nightdress',
  'pj-family-plaid': 'Family Buffalo-Plaid Set', 'pj-white-waffle': 'White Waffle Set',
  'santa-hat': 'Santa Hat', 'fairisle-beanie-scarf': 'Fair Isle Beanie & Scarf', 'plaid-scarf': 'Plaid Wool Scarf'
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Hair mass — drawn BEHIND the head so the face always reads.
function hairBack(style, skinIdx) {
  const c = HAIR[(skinIdx * 2 + style) % HAIR.length];
  switch (style % 4) {
    case 0: // cropped
      return `<ellipse cx="200" cy="118" rx="42" ry="46" fill="${c}"/>`;
    case 1: // long straight
      return `<path d="M156 118 q44 -60 88 0 l8 96 q-16 8 -22 -4 l-6 -70 q-28 14 -60 0 l-6 70 q-6 12 -22 4 Z" fill="${c}"/>`;
    case 2: // afro / coils
      return `<circle cx="200" cy="108" r="46" fill="${c}"/><circle cx="200" cy="130" r="42" fill="${c}"/>`;
    default: // bun / pulled back
      return `<ellipse cx="200" cy="116" rx="40" ry="44" fill="${c}"/><circle cx="200" cy="76" r="12" fill="${c}"/>`;
  }
}

// Small front fringe so short styles still show on the forehead.
function hairFront(style, skinIdx) {
  const c = HAIR[(skinIdx * 2 + style) % HAIR.length];
  switch (style % 4) {
    case 0:
      return `<path d="M164 108 q36 -34 72 0 q-10 -16 -36 -16 q-26 0 -36 16 Z" fill="${c}"/>`;
    case 2:
      return '';
    default:
      return `<path d="M166 106 q34 -30 68 0 q-8 -14 -34 -14 q-26 0 -34 14 Z" fill="${c}"/>`;
  }
}

function hat(kind, accent) {
  switch (kind) {
    case 'santa':
      return `<path d="M158 100 q42 -78 92 -34 l-14 40 Z" fill="#C1272D"/><rect x="150" y="94" width="104" height="16" rx="8" fill="#F4EFE4"/><circle cx="246" cy="60" r="11" fill="#F4EFE4"/>`;
    case 'witch':
      return `<path d="M200 8 L246 100 L154 100 Z" fill="#14121A"/><rect x="146" y="98" width="108" height="12" fill="#14121A"/><rect x="188" y="70" width="24" height="14" fill="${accent}"/>`;
    case 'elf':
      return `<path d="M154 100 q46 -60 92 0 Z" fill="#1B7A47"/><path d="M246 100 q22 -8 26 -24 q-18 2 -26 24 Z" fill="#1B7A47"/><circle cx="272" cy="74" r="7" fill="#C9A227"/>`;
    case 'nutcracker':
      return `<rect x="156" y="54" width="88" height="46" fill="#16255E"/><rect x="150" y="96" width="100" height="10" fill="#C9A227"/><rect x="192" y="24" width="16" height="34" fill="#C9A227"/>`;
    case 'horns':
      return `<path d="M168 92 q-12 -30 -2 -44 q14 16 14 40 Z" fill="#6E0F16"/><path d="M232 92 q12 -30 2 -44 q-14 16 -14 40 Z" fill="#6E0F16"/>`;
    case 'cat':
      return `<path d="M164 92 L156 52 L192 82 Z" fill="#141414"/><path d="M236 92 L244 52 L208 82 Z" fill="#141414"/>`;
    case 'antlers':
      return `<path d="M172 86 q-24 -18 -30 -44 q22 6 30 26 M172 70 q-18 -6 -24 -22" stroke="#6B4226" stroke-width="5" fill="none"/><path d="M228 86 q24 -18 30 -44 q-22 6 -30 26 M228 70 q18 -6 24 -22" stroke="#6B4226" stroke-width="5" fill="none"/>`;
    case 'beanie':
      return `<path d="M154 100 q46 -54 92 0 Z" fill="#E8DFC8"/><rect x="150" y="92" width="100" height="16" rx="6" fill="#E8DFC8"/><rect x="150" y="92" width="100" height="16" rx="6" fill="#C1272D" opacity="0.25"/>`;
    default:
      return '';
  }
}

function pattern(kind, x, y, w, h, accent) {
  const cx = x + w / 2;
  switch (kind) {
    case 'plaid': {
      let s = `<g stroke="${accent}" stroke-width="4" opacity="0.55">`;
      for (let i = x - h; i < x + w; i += 16) s += `<line x1="${i}" y1="${y}" x2="${i + h}" y2="${y + h}"/>`;
      for (let i = x + w + h; i > x; i -= 16) s += `<line x1="${i}" y1="${y}" x2="${i - h}" y2="${y + h}"/>`;
      return s + '</g>';
    }
    case 'fairisle': {
      let s = `<g fill="${accent}" opacity="0.8">`;
      for (let r = 0; r < 3; r++) {
        const yy = y + 22 + r * 26;
        for (let i = x + 8; i < x + w - 6; i += 18)
          s += `<path d="M${i} ${yy} l7 -9 l7 9 l-7 9 Z"/>`;
      }
      return s + '</g>';
    }
    case 'sequin': {
      let s = `<g fill="${accent}" opacity="0.7">`;
      for (let r = 0; r < 6; r++)
        for (let c = 0; c < 7; c++)
          s += `<circle cx="${x + 10 + c * ((w - 20) / 6)}" cy="${y + 14 + r * ((h - 24) / 5)}" r="3"/>`;
      return s + '</g>';
    }
    case 'fur':
      return `<rect x="${x}" y="${y + h - 16}" width="${w}" height="16" fill="${accent}"/><rect x="${cx - 7}" y="${y}" width="14" height="${h}" fill="${accent}" opacity="0.9"/>`;
    case 'stripe': {
      let s = `<g stroke="${accent}" stroke-width="6" opacity="0.5">`;
      for (let i = y + 10; i < y + h; i += 16) s += `<line x1="${x}" y1="${i}" x2="${x + w}" y2="${i}"/>`;
      return s + '</g>';
    }
    case 'cable': {
      let s = `<g stroke="${accent}" stroke-width="5" fill="none" opacity="0.6">`;
      for (let i = x + 12; i < x + w - 6; i += 18) s += `<path d="M${i} ${y} q10 ${h / 4} 0 ${h / 2} q-10 ${h / 4} 0 ${h / 2}"/>`;
      return s + '</g>';
    }
    case 'waffle': {
      let s = `<g stroke="${accent}" stroke-width="2" opacity="0.5">`;
      for (let i = x + 6; i < x + w; i += 12) s += `<line x1="${i}" y1="${y}" x2="${i}" y2="${y + h}"/>`;
      for (let i = y + 6; i < y + h; i += 12) s += `<line x1="${x}" y1="${i}" x2="${x + w}" y2="${i}"/>`;
      return s + '</g>';
    }
    case 'ribbed': {
      let s = `<g stroke="${accent}" stroke-width="3" opacity="0.45">`;
      for (let i = x + 6; i < x + w; i += 10) s += `<line x1="${i}" y1="${y}" x2="${i}" y2="${y + h}"/>`;
      return s + '</g>';
    }
    case 'lace': {
      let s = `<g fill="none" stroke="${accent}" stroke-width="2" opacity="0.6">`;
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 6; c++)
          s += `<circle cx="${x + 12 + c * ((w - 24) / 5)}" cy="${y + 16 + r * ((h - 28) / 3)}" r="5"/>`;
      return s + '</g>';
    }
    case 'bones':
      return `<g stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity="0.9"><line x1="${cx}" y1="${y + 8}" x2="${cx}" y2="${y + h - 8}"/><line x1="${x + 12}" y1="${y + 24}" x2="${x + w - 12}" y2="${y + 24}"/><line x1="${x + 16}" y1="${y + 44}" x2="${x + w - 16}" y2="${y + 44}"/><line x1="${x + 20}" y1="${y + 64}" x2="${x + w - 20}" y2="${y + 64}"/></g>`;
    case 'buttons':
      return `<g fill="${accent}"><circle cx="${cx}" cy="${y + 20}" r="5"/><circle cx="${cx}" cy="${y + 48}" r="5"/><circle cx="${cx}" cy="${y + 76}" r="5"/></g><rect x="${x + 6}" y="${y}" width="10" height="${h}" fill="${accent}"/><rect x="${x + w - 16}" y="${y}" width="10" height="${h}" fill="${accent}"/>`;
    case 'icing':
      return `<path d="M${x} ${y + 6} q${w / 4} 14 ${w / 2} 0 q${w / 4} -14 ${w / 2} 0" stroke="${accent}" stroke-width="3" fill="none"/><g fill="${accent}"><circle cx="${cx}" cy="${y + 30}" r="5"/><circle cx="${cx}" cy="${y + 52}" r="5"/><circle cx="${cx}" cy="${y + 74}" r="5"/></g>`;
    case 'cape':
      return `<path d="M${x - 8} ${y} L${x - 22} ${y + h + 20} L${cx} ${y + h} L${x + w + 22} ${y + h + 20} L${x + w + 8} ${y} Z" fill="${accent}" opacity="0.35"/>`;
    default:
      return '';
  }
}

function svg(id, i) {
  const h = H[id];
  if (!h) throw new Error(`no render hint for "${id}" — add it to scripts/gen-thumbnails.mjs`);
  const skinIdx = i % SKIN.length;
  const skin = SKIN[skinIdx];
  const hairStyle = (i * 3 + 1) % 4;
  const build = i % 3; // 0 slim, 1 regular, 2 fuller
  const halfW = [30, 38, 46][build];
  const long = !!h.long;
  const torsoY = 176;
  const torsoBottom = long ? 430 : 330;
  const torsoH = torsoBottom - torsoY;
  const tx = 200 - halfW;
  const legwear = h.legwear || skin;

  const torso = `M${200 - halfW} ${torsoY}
    q${halfW} -14 ${halfW * 2} 0
    l4 ${torsoH}
    q${-halfW} 12 ${-(halfW * 2 + 4)} 0 Z`;

  const legs = long
    ? ''
    : `<rect x="${200 - halfW + 4}" y="326" width="${halfW - 8}" height="150" rx="9" fill="${legwear}"/>
       <rect x="${200 + 4}" y="326" width="${halfW - 8}" height="150" rx="9" fill="${legwear}"/>`;

  const arms = `<rect x="${tx - 20}" y="${torsoY + 4}" width="20" height="${Math.min(torsoH, 150)}" rx="10" fill="${h.garment}"/>
    <rect x="${200 + halfW}" y="${torsoY + 4}" width="20" height="${Math.min(torsoH, 150)}" rx="10" fill="${h.garment}"/>
    <circle cx="${tx - 10}" cy="${torsoY + Math.min(torsoH, 150)}" r="9" fill="${skin}"/>
    <circle cx="${200 + halfW + 10}" cy="${torsoY + Math.min(torsoH, 150)}" r="9" fill="${skin}"/>`;

  const scarf =
    h.scarf === 'plaid'
      ? `<path d="M168 168 q32 22 64 0 l10 60 q-12 8 -18 -2 l-6 -44 q-22 12 -46 0 l-6 44 q-6 10 -18 2 Z" fill="#A52A2A"/>${pattern('plaid', 168, 168, 64, 70, h.accent)}`
      : h.scarf === 'knit'
      ? `<path d="M168 168 q32 22 64 0 l8 54 q-12 8 -18 -2 l-4 -40 q-22 12 -44 0 l-4 40 q-6 10 -18 2 Z" fill="${h.accent}"/>`
      : '';

  const grad = `g-${id}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" role="img" aria-label="${esc(LABELS[id] || id)} illustration">
  <defs><linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eee9e0"/>
  </linearGradient></defs>
  <rect width="400" height="500" fill="url(#${grad})"/>
  <ellipse cx="200" cy="486" rx="120" ry="20" fill="#1c1a17" opacity="0.12"/>
  <clipPath id="t-${id}"><path d="${torso}"/></clipPath>
  ${pattern(h.pattern === 'cape' ? 'cape' : 'none', tx, torsoY, halfW * 2, torsoH, h.accent)}
  ${legs}
  ${arms}
  <path d="${torso}" fill="${h.garment}" stroke="#1c1a17" stroke-opacity="0.14" stroke-width="2"/>
  <g clip-path="url(#t-${id})">${pattern(h.pattern, tx, torsoY, halfW * 2 + 4, torsoH, h.accent)}</g>
  <rect x="192" y="150" width="16" height="30" fill="${skin}"/>
  ${hairBack(hairStyle, skinIdx)}
  <ellipse cx="200" cy="126" rx="38" ry="44" fill="${skin}"/>
  ${hairFront(hairStyle, skinIdx)}
  ${hat(h.hat, h.accent)}
  ${scarf}
</svg>`;
}

const ids = Object.keys(H);
ids.forEach((id, i) => {
  writeFileSync(join(OUT, `${id}.svg`), svg(id, i));
});
console.log(`wrote ${ids.length} thumbnails to public/outfits/`);
