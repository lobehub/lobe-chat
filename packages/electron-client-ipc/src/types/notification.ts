export interface ShowDesktopNotificationParams {
  body: string;
  silent?: boolean;
  title: string;
}

export interface DesktopNotificationResult {
  error?: string;
  reason?: string;
  skipped?: boolean;
  success: boolean;
}
