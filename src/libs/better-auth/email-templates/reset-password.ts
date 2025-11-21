/**
 * Password reset email template
 * Sent to users when they request a password reset
 */
export const getResetPasswordEmailTemplate = (params: { url: string }) => {
  const { url } = params;

  return {
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1a1a1a; font-size: 32px; margin: 0;">🤯 LobeChat</h1>
            </div>

            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px;">
              <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Reset Your Password</h2>

              <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}"
                   style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
                If you didn't request this password reset, you can safely ignore this email.
              </p>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 16px 0 0 0;">
                Or copy and paste this URL into your browser:<br>
                <a href="${url}" style="color: #3b82f6; word-break: break-all;">${url}</a>
              </p>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                © ${new Date().getFullYear()} LobeChat. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    subject: 'Reset Your Password - LobeChat',
    text: `Reset your password by clicking this link: ${url}`,
  };
};
