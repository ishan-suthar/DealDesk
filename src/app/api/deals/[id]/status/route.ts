import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dealsRepository } from '@/server/repositories/dealsRepository';
import { transition, InvalidStatusTransitionError, UserStatusAction } from '@/domain/userStatus';

export const runtime = 'nodejs';

const StatusActionSchema = z.object({
  action: z.enum(['hold', 'unhold', 'save', 'reject', 'remove', 'restore', 'purge']),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parse = StatusActionSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid action', details: parse.error.format() }, { status: 400 });
    }

    const { action } = parse.data;
    const deal = await dealsRepository.getById(params.id);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const previousStatus = deal.userStatus;

    try {
      const transitionResult = transition(deal.userStatus, action as UserStatusAction, deal.statusBeforeDelete);

      if (transitionResult.isPurged) {
        await dealsRepository.purge(params.id);
        return NextResponse.json({ success: true, isPurged: true, previousStatus });
      }

      const updated = await dealsRepository.updateStatus(
        params.id,
        transitionResult.nextStatus,
        transitionResult.statusBeforeDelete
      );

      return NextResponse.json({ deal: updated, previousStatus });
    } catch (err: any) {
      if (err instanceof InvalidStatusTransitionError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
