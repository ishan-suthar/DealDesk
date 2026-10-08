export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { notesRepository } from '@/server/repositories/notesRepository';

const ReorderSchema = z.object({
  orderedIds: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = ReorderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid reorder data: ' + parseResult.error.message },
        { status: 400 }
      );
    }

    await notesRepository.reorder(parseResult.data.orderedIds);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reorder notes' },
      { status: 500 }
    );
  }
}
