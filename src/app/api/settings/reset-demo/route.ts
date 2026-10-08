import { NextResponse } from 'next/server';
import { seedDatabase } from '@/server/db/seed';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const isLive = process.env.RESEARCH_PROVIDER && process.env.RESEARCH_PROVIDER !== 'demo';
    if (isLive) {
      return NextResponse.json(
        { error: 'Cannot reset demo data while running in live research mode.' },
        { status: 403 }
      );
    }

    await seedDatabase(new Date());
    return NextResponse.json({ success: true, message: 'Demo data reset successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
