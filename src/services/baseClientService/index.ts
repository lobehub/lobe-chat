const getClientDBUserId = () => {
  if (typeof window === 'undefined') return undefined;

  return window.__lobeClientUserId;
};

const FALLBACK_CLIENT_DB_USER_ID = 'DEFAULT_LOBE_CHAT_USER';

export class BaseClientService {
  private readonly fallbackUserId: string;

  protected get userId(): string {
    return getClientDBUserId() || this.fallbackUserId;
  }

  constructor(userId?: string) {
    this.fallbackUserId = userId || FALLBACK_CLIENT_DB_USER_ID;
  }
}
