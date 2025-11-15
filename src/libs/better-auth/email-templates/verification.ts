/**
 * Email verification template
 * Sent to users when they sign up to verify their email address
 */
export const getVerificationEmailTemplate = (params: {
  expiresInSeconds: number;
  url: string;
  userName?: string | null;
}) => {
  const { url, userName, expiresInSeconds } = params;

  // Format expiration time in a human-readable way
  const expiresInHours = expiresInSeconds / 3600;
  const expirationText =
    expiresInHours >= 1
      ? `${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}`
      : `${expiresInSeconds / 60} minutes`;

  return {
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

            <!-- Logo Section -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #18181b; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -1px;">
                🤯 LobeChat
              </h1>
            </div>

            <!-- Main Card -->
            <div style="background: #ffffff; border-radius: 20px; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02);">

              <!-- Title -->
              <h2 style="color: #0a0a0a; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center; letter-spacing: -0.5px;">
                Verify Your Email
              </h2>

              <!-- Subtitle -->
              <p style="color: #737373; font-size: 15px; margin: 0 0 32px 0; text-align: center;">
                Welcome to LobeChat, ${userName || 'there'}! 👋
              </p>

              <!-- Main Message -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin: 0 0 32px 0; border: 1px solid #e2e8f0;">
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0; text-align: center;">
                  To get started with your AI-powered conversations, please verify your email address.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 0 0 32px 0;">
                <a href="${url}"
                   style="display: inline-block;
                          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                          color: #ffffff;
                          text-decoration: none;
                          padding: 18px 56px;
                          border-radius: 12px;
                          font-weight: 600;
                          font-size: 16px;
                          letter-spacing: 0.3px;
                          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4), 0 8px 24px rgba(59, 130, 246, 0.2);">
                  Verify Email Address →
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 0 0 24px 0;">
                <div style="display: flex; align-items: start;">
                  <p style="color: #0369a1; font-size: 13px; line-height: 1.6; margin: 0;">
                    <span style="display: block; font-weight: 700; font-size: 14px; margin-bottom: 6px;">🔒 Security First</span>
                    This verification link will expire in <strong>${expirationText}</strong> to protect your account.
                  </p>
                </div>
              </div>

              <!-- Alternative Link Section -->
              <details style="margin: 24px 0 0 0;">
                <summary style="color: #71717a; font-size: 13px; font-weight: 500; cursor: pointer; user-select: none; padding: 12px; background: #fafafa; border-radius: 8px; list-style: none; text-align: center;">
                  ⚙️ Having trouble? Click here for alternative options
                </summary>
                <div style="margin-top: 16px; padding: 16px; background: #fafafa; border: 2px dashed #e4e4e7; border-radius: 12px;">
                  <p style="color: #71717a; font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    Copy & Paste This Link:
                  </p>
                  <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);">
                    <p style="margin: 0; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace; font-size: 12px; color: #18181b; word-break: break-all; user-select: all; line-height: 1.5;">
                      ${url}
                    </p>
                  </div>
                </div>
              </details>

              <!-- Divider -->
              <div style="height: 1px; background: linear-gradient(to right, transparent 0%, #e5e7eb 50%, transparent 100%); margin: 40px 0 24px 0;"></div>

              <!-- Footer Note -->
              <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
                Didn't create an account? You can safely ignore this email.
              </p>
            </div>

            <!-- Brand Footer -->
            <div style="text-align: center; margin-top: 40px;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 4px 0; font-weight: 500;">
                © ${new Date().getFullYear()} LobeChat · All rights reserved
              </p>
              <p style="color: #d4d4d8; font-size: 11px; margin: 0; letter-spacing: 0.3px;">
                Your Modern AI Chat Interface
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    subject: 'Verify Your Email - LobeChat',
    text: `Please verify your email by clicking this link: ${url}\n\nThis link will expire in ${expirationText}.`,
  };
};
