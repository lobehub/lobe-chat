// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';

import SepayService, { SepayWebhookData } from './sepay';

// Ensure required envs for constructor (webhook tests instantiate service)
beforeEach(() => {
  process.env.SEPAY_API_KEY = 'test-api-key';
  process.env.SEPAY_ACCOUNT_NUMBER = '123456789';
  process.env.SEPAY_BANK_NAME = 'MBBank';
});

describe('SepayService.verifyWebhook', () => {
  it('returns false when header is missing', () => {
    const svc = new SepayService();
    expect(svc.verifyWebhook(null)).toBe(false);
  });

  it('returns false when header is incorrect', () => {
    const svc = new SepayService();
    expect(svc.verifyWebhook('Apikey wrong-key')).toBe(false);
  });

  it('accepts correct header with exact match', () => {
    const svc = new SepayService();
    expect(svc.verifyWebhook('Apikey test-api-key')).toBe(true);
  });

  it('accepts scheme case-insensitively (apikey vs Apikey)', () => {
    const svc = new SepayService();
    expect(svc.verifyWebhook('apikey test-api-key')).toBe(true);
  });
});

describe('SepayService.processWebhookData', () => {
  const base: SepayWebhookData = {
    accountNumber: '123456789',
    accumulated: 0,
    code: null,
    content: 'LC12345 Payment',
    description: 'desc',
    gateway: 'sepay',
    id: 111,
    referenceCode: 'ref-xyz',
    subAccount: null,
    transactionDate: '2025-01-01T00:00:00Z',
    transferAmount: 29000,
    transferType: 'in',
  };

  it('marks success when transferType is "in" and extracts orderCode', () => {
    const svc = new SepayService();
    const res = svc.processWebhookData(base);
    expect(res.isValid).toBe(true);
    expect(res.status).toBe('success');
    expect(res.orderCode).toBe('LC12345');
    expect(res.amount).toBe(29000);
  });

  it('marks failed when transferType is not "in"', () => {
    const svc = new SepayService();
    const res = svc.processWebhookData({ ...base, transferType: 'out' });
    expect(res.status).toBe('failed');
  });
});

describe('SepayService.utilities', () => {
  it('formats VND amounts correctly', () => {
    const svc = new SepayService();
    // e.g. "29.000 ₫" in vi-VN locale
    expect(svc.formatVNDAmount(29000)).toContain('29');
  });

  it('generates unique order codes', () => {
    const svc = new SepayService();
    const a = svc.generateOrderCode();
    const b = svc.generateOrderCode();
    expect(a).not.toEqual(b);
    expect(a.startsWith('LC')).toBe(true);
  });
});
