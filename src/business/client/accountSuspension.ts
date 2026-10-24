export interface AccountSuspensionNotice {
  reason: 'provider_content_moderation';
  retryAt: string;
}

export const getAccountSuspensionNotice = async (): Promise<AccountSuspensionNotice | undefined> =>
  undefined;
