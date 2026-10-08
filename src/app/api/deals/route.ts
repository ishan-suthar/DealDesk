import { NextResponse } from 'next/server';
import { dealsRepository } from '@/server/repositories/dealsRepository';
import { UserStatusSchema } from '@/domain/schemas';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userStatusParam = url.searchParams.get('userStatus');
    const sectorParam = url.searchParams.get('sector') || undefined;

    let userStatus = undefined;
    if (userStatusParam) {
      const parsedStatus = UserStatusSchema.safeParse(userStatusParam);
      if (!parsedStatus.success) {
        return NextResponse.json({ error: 'Invalid userStatus filter' }, { status: 400 });
      }
      userStatus = parsedStatus.data;
    }

    const deals = await dealsRepository.list({ userStatus, sector: sectorParam });
    return NextResponse.json({ deals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
