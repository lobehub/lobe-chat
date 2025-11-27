import { NodemailerImpl } from './nodemailer';
import { EmailServiceImpl } from './type';

/**
 * Available email service implementations
 */
export enum EmailImplType {
  Nodemailer = 'nodemailer',
  // Future providers can be added here:
  // Resend = 'resend',
  // SendGrid = 'sendgrid',
}

/**
 * Create an email service implementation instance
 */
export const createEmailServiceImpl = (
  type: EmailImplType = EmailImplType.Nodemailer,
): EmailServiceImpl => {
  switch (type) {
    case EmailImplType.Nodemailer: {
      return new NodemailerImpl();
    }

    default: {
      return new NodemailerImpl();
    }
  }
};

export type { EmailServiceImpl } from './type';
export type { EmailPayload, EmailResponse } from './type';
