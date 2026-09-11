import { promises as fs } from 'fs';
import path from 'path';

/**
 * Tracks how many times each outfit has been tried on, so an admin can see
 * which styles are popular.
 *
 * Storage has two backends, auto-selected:
 *  - Vercel KV / Upstash Redis (REST API), when KV_REST_API_URL +
 *    KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* equivalents) are set.
 *    This is the one that actually persists on serverless (Vercel) — add a
 *    KV database to the project (Vercel dashboard -> Storage -> Create
 *    Database -> KV) and it wires itself up automatically, no code changes.
 *  - A local JSON file (.data/tryon-counts.json), used otherwise. Fine for
 *    `npm run dev` / a single long-lived server, but on serverless hosting
 *    without KV configured each function instance has its own ephemeral
 *    filesystem, so counts will NOT be reliably shared or persisted.
 */

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ZSET_KEY = 'stylemyseason:tryon_counts';

const FILE = path.join(process.cwd(), '.data', 'tryon-counts.json');

export const analyticsBackend: 'kv' | 'file' = KV_URL && KV_TOKEN ? 'kv' : 'file';

async function kv(pathSegments: string[]): Promise<any> {
  const url = `${KV_URL}/${pathSegments.map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${KV_TOKEN}` }, cache: 'no-store' });
  if (!res.ok) throw new Error(`KV request failed (${res.status}): ${await res.text()}`);
  const body = await res.json();
  return body.result;
}

async function readFileCounts(): Promise<Record<string, number>> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function writeFileCounts(counts: Record<string, number>): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(counts, null, 2));
}

/** Call once a try-on generation succeeds. Never throws — analytics must not break the app. */
export async function recordTryOn(outfitId: string): Promise<void> {
  if (!outfitId) return;
  try {
    if (analyticsBackend === 'kv') {
      await kv(['zincrby', ZSET_KEY, '1', outfitId]);
    } else {
      const counts = await readFileCounts();
      counts[outfitId] = (counts[outfitId] || 0) + 1;
      await writeFileCounts(counts);
    }
  } catch (err) {
    console.error('recordTryOn failed:', err);
  }
}

/** Returns { outfitId: count } for every outfit that has been tried on at least once. */
export async function getTryOnCounts(): Promise<Record<string, number>> {
  if (analyticsBackend === 'kv') {
    const flat: unknown[] = (await kv(['zrange', ZSET_KEY, '0', '-1', 'WITHSCORES'])) || [];
    const counts: Record<string, number> = {};
    for (let i = 0; i < flat.length; i += 2) counts[String(flat[i])] = Number(flat[i + 1]);
    return counts;
  }
  return readFileCounts();
}
