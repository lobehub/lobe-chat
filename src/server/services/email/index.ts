import { EmailImplType, EmailPayload, EmailResponse, createEmailServiceImpl } from './impls';
import type { EmailServiceImpl } from './impls';

/**
 * Email service class
 * Provides email sending functionality with multiple provider support
 */
export class EmailService {
  private emailImpl: EmailServiceImpl;

  constructor(implType?: EmailImplType) {
    // Validate SMTP_USER is configured
    if (!process.env.SMTP_USER) {
      throw new Error(
        'SMTP_USER environment variable is required to use email service. Please configure SMTP settings in your .env file.',
      );
    }

    this.emailImpl = createEmailServiceImpl(implType);
  }

  /**
   * Send an email
   */
  async sendMail(payload: EmailPayload): Promise<EmailResponse> {
    return this.emailImpl.sendMail(payload);
  }

  /**
   * Verify the email service configuration
   * Note: Only available for Nodemailer implementation
   */
  async verify(): Promise<boolean> {
    // Check if the implementation has a verify method
    if ('verify' in this.emailImpl && typeof this.emailImpl.verify === 'function') {
      return this.emailImpl.verify();
    }

    // For implementations without verify, assume it's valid
    return true;
  }
}

// Export a default instance for convenience
export const emailService = new EmailService();

// Export types
export type { EmailPayload, EmailResponse } from './impls';
export { EmailImplType } from './impls';
