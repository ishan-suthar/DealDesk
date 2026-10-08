import { UserStatus } from './enums';

export type UserStatusAction =
  | 'hold'
  | 'unhold'
  | 'save'
  | 'reject'
  | 'remove'
  | 'restore'
  | 'purge';

export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly currentStatus: UserStatus,
    public readonly action: UserStatusAction,
    message?: string
  ) {
    super(
      message ??
        `Invalid status transition: cannot execute action '${action}' from status '${currentStatus}'`
    );
    this.name = 'InvalidStatusTransitionError';
  }
}

export interface TransitionResult {
  nextStatus: UserStatus;
  statusBeforeDelete?: Exclude<UserStatus, 'deleted'>;
  isPurged?: boolean;
}

export function transition(
  current: UserStatus,
  action: UserStatusAction,
  statusBeforeDelete?: Exclude<UserStatus, 'deleted'>
): TransitionResult {
  switch (action) {
    case 'hold': {
      if (current === 'discovered') {
        return { nextStatus: 'review' };
      }
      throw new InvalidStatusTransitionError(current, action);
    }

    case 'unhold': {
      if (current === 'review') {
        return { nextStatus: 'discovered' };
      }
      throw new InvalidStatusTransitionError(current, action);
    }

    case 'save': {
      if (current === 'discovered' || current === 'review') {
        return { nextStatus: 'saved' };
      }
      throw new InvalidStatusTransitionError(current, action);
    }

    case 'reject': {
      if (current === 'discovered' || current === 'review') {
        return {
          nextStatus: 'deleted',
          statusBeforeDelete: current,
        };
      }
      throw new InvalidStatusTransitionError(current, action);
    }

    case 'remove': {
      if (current === 'saved') {
        return {
          nextStatus: 'deleted',
          statusBeforeDelete: 'saved',
        };
      }
      throw new InvalidStatusTransitionError(current, action);
    }

    case 'restore': {
      if (current === 'deleted') {
        const restoredStatus = statusBeforeDelete ?? 'discovered';
        return {
          nextStatus: restoredStatus,
          statusBeforeDelete: undefined,
        };
      }
      throw new InvalidStatusTransitionError(current, action);
    }

    case 'purge': {
      if (current === 'deleted') {
        return {
          nextStatus: 'deleted',
          isPurged: true,
        };
      }
      throw new InvalidStatusTransitionError(current, action);
    }

    default: {
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${_exhaustive}`);
    }
  }
}
