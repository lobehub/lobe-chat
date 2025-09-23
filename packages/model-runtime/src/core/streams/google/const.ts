export const GOOGLE_AI_BLOCK_REASON = {
  BLOCKLIST:
    'Your content contains prohibited terms. Please review and modify your input, then try again.',
  IMAGE_SAFETY:
    'The generated image was blocked for safety reasons. Please try modifying your image request.',
  LANGUAGE:
    'The language you are using is not supported. Please try again in English or another supported language.',
  OTHER: 'The content was blocked for an unknown reason. Please try rephrasing your request.',
  PROHIBITED_CONTENT:
    'Your request may contain prohibited content. Please adjust your request to comply with the usage guidelines.',
  RECITATION:
    'Your content was blocked due to potential copyright concerns. Please try using original content or rephrase your request.',
  SAFETY:
    'Your content was blocked for safety policy reasons. Please adjust your request to avoid potentially harmful or inappropriate content.',
  SPII: 'Your content may contain sensitive personally identifiable information (PII). To protect privacy, please remove any sensitive details and try again.',
  default: 'Content blocked: {{blockReason}}. Please adjust your request and try again.',
} as const;
