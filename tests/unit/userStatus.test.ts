import { describe, it, expect } from 'vitest';
import {
  transition,
  InvalidStatusTransitionError,
  UserStatusAction,
} from '@/domain/userStatus';
import { UserStatus } from '@/domain/enums';

describe('userStatus state machine', () => {
  describe('Valid transitions', () => {
    it('discovered -> hold -> review', () => {
      const res = transition('discovered', 'hold');
      expect(res.nextStatus).toBe('review');
    });

    it('review -> unhold -> discovered', () => {
      const res = transition('review', 'unhold');
      expect(res.nextStatus).toBe('discovered');
    });

    it('discovered -> save -> saved', () => {
      const res = transition('discovered', 'save');
      expect(res.nextStatus).toBe('saved');
    });

    it('review -> save -> saved', () => {
      const res = transition('review', 'save');
      expect(res.nextStatus).toBe('saved');
    });

    it('discovered -> reject -> deleted with statusBeforeDelete recorded', () => {
      const res = transition('discovered', 'reject');
      expect(res.nextStatus).toBe('deleted');
      expect(res.statusBeforeDelete).toBe('discovered');
    });

    it('review -> reject -> deleted with statusBeforeDelete recorded', () => {
      const res = transition('review', 'reject');
      expect(res.nextStatus).toBe('deleted');
      expect(res.statusBeforeDelete).toBe('review');
    });

    it('saved -> remove -> deleted with statusBeforeDelete: saved', () => {
      const res = transition('saved', 'remove');
      expect(res.nextStatus).toBe('deleted');
      expect(res.statusBeforeDelete).toBe('saved');
    });

    it('deleted -> restore -> returns statusBeforeDelete (e.g. review)', () => {
      const res = transition('deleted', 'restore', 'review');
      expect(res.nextStatus).toBe('review');
      expect(res.statusBeforeDelete).toBeUndefined();
    });

    it('deleted -> restore -> defaults to discovered if statusBeforeDelete was missing', () => {
      const res = transition('deleted', 'restore', undefined);
      expect(res.nextStatus).toBe('discovered');
    });

    it('deleted -> purge -> permanently removed', () => {
      const res = transition('deleted', 'purge');
      expect(res.nextStatus).toBe('deleted');
      expect(res.isPurged).toBe(true);
    });
  });

  describe('Invalid transitions throwing InvalidStatusTransitionError', () => {
    const invalidCases: [UserStatus, UserStatusAction][] = [
      ['discovered', 'unhold'],
      ['discovered', 'remove'],
      ['discovered', 'restore'],
      ['discovered', 'purge'],
      ['review', 'hold'],
      ['review', 'remove'],
      ['review', 'restore'],
      ['review', 'purge'],
      ['saved', 'hold'],
      ['saved', 'unhold'],
      ['saved', 'save'],
      ['saved', 'reject'],
      ['saved', 'restore'],
      ['saved', 'purge'],
      ['deleted', 'hold'],
      ['deleted', 'unhold'],
      ['deleted', 'save'],
      ['deleted', 'reject'],
      ['deleted', 'remove'],
    ];

    invalidCases.forEach(([from, action]) => {
      it(`fails from ${from} with action ${action}`, () => {
        expect(() => transition(from, action)).toThrow(InvalidStatusTransitionError);
      });
    });
  });
});
