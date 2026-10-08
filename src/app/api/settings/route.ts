import { NextResponse } from 'next/server';
import { z } from 'zod';
import { settingsRepository } from '@/server/repositories/settingsRepository';

export const runtime = 'nodejs';

const UpdateSettingsSchema = z.object({
  displayName: z.string().min(1).max(50),
});

export async function GET() {
  try {
    const settings = await settingsRepository.getSettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const parse = UpdateSettingsSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid settings payload', details: parse.error.format() }, { status: 400 });
    }

    const updated = await settingsRepository.updateDisplayName(parse.data.displayName);
    return NextResponse.json({ settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
