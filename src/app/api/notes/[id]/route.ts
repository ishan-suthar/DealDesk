export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { notesRepository } from '@/server/repositories/notesRepository';

const UpdateNoteSchema = z.object({
  comment: z.string().optional(),
  pinned: z.boolean().optional(),
  position: z.number().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const parseResult = UpdateNoteSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid update: ' + parseResult.error.message },
        { status: 400 }
      );
    }

    const updated = await notesRepository.update(id, parseResult.data);
    if (!updated) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ note: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const success = await notesRepository.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete note' },
      { status: 500 }
    );
  }
}
