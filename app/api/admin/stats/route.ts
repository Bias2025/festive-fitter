import { NextRequest, NextResponse } from 'next/server';
import { analyticsBackend, getTryOnCounts } from '@/lib/analytics';
import catalog from '@/lib/catalog.json';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: 'Server is missing ADMIN_TOKEN. Set it in your environment to enable the admin stats API.' },
      { status: 500 }
    );
  }

  const provided = req.headers.get('x-admin-token') || req.nextUrl.searchParams.get('token');
  if (provided !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const counts = await getTryOnCounts();
  const byId = new Map(catalog.map((o) => [o.id, o]));

  const styles = Object.entries(counts)
    .map(([id, count]) => {
      const outfit = byId.get(id);
      return {
        id,
        count,
        label: outfit?.label ?? id,
        season: outfit?.season ?? null,
        category: outfit?.category ?? null
      };
    })
    .sort((a, b) => b.count - a.count);

  const total = styles.reduce((sum, s) => sum + s.count, 0);

  return NextResponse.json({ backend: analyticsBackend, total, styles });
}
