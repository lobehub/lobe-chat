/**
 * Email verification template
 * Sent to users when they sign up to verify their email address
 */
export const getVerificationEmailTemplate = (params: { url: string; userName?: string | null }) => {
  const { url, userName } = params;

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
              <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Verify Your Email Address</h2>

              <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 8px 0;">
                Hi ${userName || 'there'},
              </p>

              <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                Thank you for signing up for LobeChat! Please verify your email address by clicking the button below:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}"
                   style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  Verify Email
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
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
    subject: 'Verify Your Email - LobeChat',
    text: `Please verify your email by clicking this link: ${url}`,
  };
};
