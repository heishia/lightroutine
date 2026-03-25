export const API_VERSION = 'v1';

export const ROUTINE_LIMITS = {
  MAX_ROUTINES_PER_USER: 50,
  MAX_NAME_LENGTH: 100,
} as const;

export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NICKNAME_LENGTH: 20,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
