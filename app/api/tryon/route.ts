import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const REPLICATE_API_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions';

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Server is missing REPLICATE_API_TOKEN. Add it to .env.local and restart.' },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const photo = form.get('photo');
  const outfitPrompt = form.get('outfitPrompt');

  if (!(photo instanceof File) || typeof outfitPrompt !== 'string') {
    return NextResponse.json({ error: 'Missing photo or outfitPrompt in request.' }, { status: 400 });
  }

  const bytes = await photo.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const dataUrl = `data:${photo.type};base64,${base64}`;

  const prompt = `Change the person's outfit to ${outfitPrompt}. Keep the person's face, pose, body proportions, and the background exactly the same. Only change the clothing. Make the new outfit look photorealistic and well-fitted, with natural lighting and shadows that match the original photo.`;

  try {
    const createRes = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait'
      },
      body: JSON.stringify({
        input: {
          prompt,
          input_image: dataUrl,
          output_format: 'png',
          safety_tolerance: 2
        }
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      return NextResponse.json({ error: `Replicate error: ${errText}` }, { status: 502 });
    }

    let prediction = await createRes.json();

    // If Prefer: wait didn't resolve it synchronously, poll until done.
    let attempts = 0;
    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      prediction.status !== 'canceled' &&
      attempts < 30
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(prediction.urls.get, {
        headers: { Authorization: `Bearer ${token}` }
      });
      prediction = await pollRes.json();
      attempts += 1;
    }

    if (prediction.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Generation did not succeed (status: ${prediction.status}).` },
        { status: 502 }
      );
    }

    const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    return NextResponse.json({ imageUrl: outputUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown server error.' }, { status: 500 });
  }
}
