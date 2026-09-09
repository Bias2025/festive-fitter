# The Fitting Room

A minimal virtual try-on web app for Halloween and Christmas outfits. Upload a
photo, pick an outfit off the rack, and get back an image of yourself wearing
it. Built with Next.js (App Router) and Replicate's FLUX Kontext model — no
model training, no custom infrastructure.

## How it works

1. User uploads a photo in the browser.
2. On "Try it on," the photo and a text description of the chosen outfit are
   sent to `/api/tryon`.
3. The API route calls Replicate's `black-forest-labs/flux-kontext-pro` model,
   which edits the photo to swap the outfit while preserving the person's
   face, pose, and background.
4. The resulting image is returned and shown in the booth, with a download
   link.

## Setup

```bash
npm install
cp .env.example .env.local
```

Get a Replicate API token at https://replicate.com/account/api-tokens and put
it in `.env.local`:

```
REPLICATE_API_TOKEN=r8_...
```

Run locally:

```bash
npm run dev
```

Open http://localhost:3000.

## Deploying

This is a standard Next.js app — it deploys as-is to Vercel:

```bash
npm i -g vercel
vercel
```

Add `REPLICATE_API_TOKEN` as an environment variable in the Vercel project
settings (not just `.env.local`, which doesn't ship with the deploy).

## Replacing the placeholder outfits

`public/outfits/*.svg` are placeholder thumbnails so the app runs out of the
box. For real results:

1. Replace each SVG (or repoint the `thumbnail` field in `lib/outfits.ts`)
   with an actual product photo or flat-lay of the costume/outfit — JPG or
   PNG, plain background, front-facing.
2. Tighten the matching `prompt` string in `lib/outfits.ts` to describe that
   specific garment (color, silhouette, notable details). The model is
   prompt-driven, not the reference image, so the prompt quality is what
   drives result quality here.
3. Add more entries to the `OUTFITS` array for a bigger rack — no code
   changes needed elsewhere, the UI reads from that array.

## Cost and speed notes

- Each generation is a single Replicate API call, billed per call (FLUX
  Kontext Pro is roughly a few cents per image at the time of writing —
  check current pricing on Replicate).
- Typical generation time is 10-20 seconds; the API route polls for up to
  ~60 seconds before giving up.
- There's no queue or rate limiting built in. For a public-facing version,
  add basic rate limiting (e.g. by IP or session) before it gets hammered.

## What's deliberately left out (v1 scope)

- No database, no accounts, no saved history — everything is one-shot and
  in-memory.
- No moderation/content filtering beyond Replicate's built-in
  `safety_tolerance` setting. Add stronger checks before letting strangers
  upload arbitrary photos in production.
- No image storage — the returned Replicate URL is time-limited. Add
  upload-to-storage (S3, Vercel Blob, etc.) if you need results to persist.
