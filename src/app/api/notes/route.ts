export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { notesRepository } from '@/server/repositories/notesRepository';
import { TemplateSectionKeySchema } from '@/domain/schemas';

const CreateNoteSchema = z.object({
  dealId: z.string().optional(),
  templateSection: TemplateSectionKeySchema.optional(),
  quote: z.string().optional(),
  blockId: z.string().optional(),
  coveredBlockIds: z.array(z.string()).default([]),
  sourceIds: z.array(z.string()).default([]),
  reportVersionId: z.string().optional(),
  comment: z.string().default(''),
  pinned: z.boolean().default(false),
  position: z.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId') || undefined;
    const templateSection = searchParams.get('templateSection') || undefined;
    const search = searchParams.get('search') || undefined;

    const notes = await notesRepository.list({
      dealId,
      templateSection,
      search,
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateNoteSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid note data: ' + parseResult.error.message },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Strict validation on 2,000-character limit
    if (data.quote && data.quote.length > 2000) {
      return NextResponse.json(
        { error: 'Max saved selection: 2,000 characters' },
        { status: 400 }
      );
    }

    const id = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newNote = await notesRepository.create({
      id,
      dealId: data.dealId,
      templateSection: data.templateSection,
      quote: data.quote,
      blockId: data.blockId,
      coveredBlockIds: data.coveredBlockIds,
      sourceIds: data.sourceIds,
      reportVersionId: data.reportVersionId,
      comment: data.comment,
      pinned: data.pinned,
      position: data.position,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create note' },
      { status: 500 }
    );
  }
}
