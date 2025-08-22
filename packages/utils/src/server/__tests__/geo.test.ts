import { geolocation } from '@vercel/functions';
import { getCountry } from 'countries-and-timezones';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { parseDefaultThemeFromCountry } from '../geo';

vi.mock('@vercel/functions', () => ({
  geolocation: vi.fn(),
}));

vi.mock('countries-and-timezones', () => ({
  getCountry: vi.fn(),
}));

describe('parseDefaultThemeFromCountry', () => {
  const mockRequest = (headers: Record<string, string> = {}) => {
    return {
      headers: {
        get: (key: string) => headers[key],
      },
    } as NextRequest;
  };

  it('should return light theme when no country code is found', () => {
    vi.mocked(geolocation).mockReturnValue({});
    const request = mockRequest();
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should return light theme when country has no timezone', () => {
    vi.mocked(geolocation).mockReturnValue({ country: 'US' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      timezones: [],
    });
    const request = mockRequest();
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should return light theme when country has invalid timezone', () => {
    vi.mocked(geolocation).mockReturnValue({ country: 'US' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      // @ts-ignore
      timezones: ['America/Invalid'],
    });

    const mockDate = new Date('2025-04-01T12:00:00');
    vi.setSystemTime(mockDate);

    const request = mockRequest();
    expect(parseDefaultThemeFromCountry(request)).toBe('light');
  });

  it('should return light theme during daytime hours', () => {
    vi.mocked(geolocation).mockReturnValue({ country: 'US' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      timezones: ['America/New_York'],
    });

    // 设置UTC时间16:00，这样在纽约时区（EDT，UTC-4）就是12:00
    const mockDate = new Date('2025-04-01T16:00:00.000Z');
    vi.setSystemTime(mockDate);

    const request = mockRequest();
    const result = parseDefaultThemeFromCountry(request);
    expect(result).toBe('light');
  });

  it('should return dark theme during night hours', () => {
    vi.mocked(geolocation).mockReturnValue({ country: 'US' });
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      timezones: ['America/New_York'],
    });

    // 设置UTC时间02:00，这样在纽约时区（EDT，UTC-4）就是22:00
    const mockDate = new Date('2025-04-01T02:00:00.000Z');
    vi.setSystemTime(mockDate);

    const request = mockRequest();
    expect(parseDefaultThemeFromCountry(request)).toBe('dark');
  });

  it('should try different header sources for country code', () => {
    vi.mocked(geolocation).mockReturnValue({});
    vi.mocked(getCountry).mockReturnValue({
      id: 'US',
      name: 'United States',
      timezones: ['America/New_York'],
    });

    const headers = {
      'x-vercel-ip-country': 'US',
      'cf-ipcountry': 'CA',
      'x-zeabur-ip-country': 'UK',
      'x-country-code': 'FR',
    };

    const request = mockRequest(headers);
    parseDefaultThemeFromCountry(request);

    expect(getCountry).toHaveBeenCalledWith('US');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });
});
