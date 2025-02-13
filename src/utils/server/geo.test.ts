import { getCountry } from 'countries-and-timezones';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { parseDefaultThemeFromCountry } from './geo';

vi.mock('countries-and-timezones');

describe('parseDefaultThemeFromCountry', () => {
  const mockRequest = (headers: Record<string, string | null> = {}, geo?: any): NextRequest =>
    ({
      headers: {
        get: (key: string) => headers[key] || null,
      },
      geo,
    }) as unknown as NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return light theme when no country code is found', () => {
    const request = mockRequest();
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should return light theme when country has no timezone info', () => {
    const request = mockRequest({ 'x-vercel-ip-country': 'US' });
    vi.mocked(getCountry).mockReturnValue(undefined);
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should get country code from request.geo', () => {
    const request = mockRequest({}, { country: 'US' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      timezones: ['America/New_York'],
    });

    // Set time to noon UTC
    vi.setSystemTime(new Date('2025-02-14T12:00:00Z'));
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should get country code from various headers', () => {
    const headers = {
      'x-vercel-ip-country': null,
      'cf-ipcountry': 'CN',
      'x-zeabur-ip-country': null,
      'x-country-code': null,
    };

    const request = mockRequest(headers);
    vi.mocked(getCountry).mockReturnValue({
      id: 'CN',
      name: 'China',
      timezones: ['Asia/Shanghai'],
    });

    vi.setSystemTime(new Date('2025-02-14T20:00:00Z'));
    expect(parseDefaultThemeFromCountry(request)).toBe('dark');
  });

  it('should return light theme during daytime hours (6-18)', () => {
    const request = mockRequest({ 'x-vercel-ip-country': 'JP' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'JP',
      name: 'Japan',
      timezones: ['Asia/Tokyo'],
    });

    // Set time to 3:00 AM UTC (12:00 JST)
    vi.setSystemTime(new Date('2025-02-14T03:00:00Z'));
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should return dark theme during nighttime hours', () => {
    const request = mockRequest({ 'x-vercel-ip-country': 'JP' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'JP',
      name: 'Japan',
      timezones: ['Asia/Tokyo'],
    });

    // Set time to 20:00 UTC (05:00 JST next day)
    vi.setSystemTime(new Date('2025-02-14T20:00:00Z'));
    expect(parseDefaultThemeFromCountry(request)).toBe('dark');
  });

  it('should return light theme for edge case at 6:00', () => {
    const request = mockRequest({ 'x-vercel-ip-country': 'US' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      timezones: ['America/New_York'],
    });

    vi.setSystemTime(new Date('2025-02-14T11:00:00Z')); // 6:00 AM EST
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should return dark theme for edge case at 18:00', () => {
    const request = mockRequest({ 'x-vercel-ip-country': 'US' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      timezones: ['America/New_York'],
    });

    vi.setSystemTime(new Date('2025-02-14T23:00:00Z')); // 18:00 EST
    expect(parseDefaultThemeFromCountry(request)).toBe('dark');
  });
});
