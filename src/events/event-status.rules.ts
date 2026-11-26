import { EventStatus } from './schemas/event.schema';

// Defines which status changes are allowed.
export const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],

  [EventStatus.PUBLISHED]: [
    EventStatus.POSTPONED,
    EventStatus.CANCELLED,
    EventStatus.COMPLETED,
  ],

  [EventStatus.POSTPONED]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],

  // These are final statuses.
  [EventStatus.CANCELLED]: [],
  [EventStatus.COMPLETED]: [],
};

// Checks whether a requested status change is permitted.
export function canTransition(from: EventStatus, to: EventStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
