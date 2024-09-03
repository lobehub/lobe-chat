import { describe, expect, it } from 'vitest';

import { formatSize, formatSpeed, formatTime, formatTokenNumber } from './format';

describe('formatSize', () => {
  it('should format bytes to KB correctly', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(2048)).toBe('2.0 KB');
    expect(formatSize(1536)).toBe('1.5 KB');
  });

  it('should format bytes to MB correctly', () => {
    expect(formatSize(1048576)).toBe('1.0 MB');
    expect(formatSize(2097152)).toBe('2.0 MB');
    expect(formatSize(1572864)).toBe('1.5 MB');
  });

  it('should format bytes to GB correctly', () => {
    expect(formatSize(1073741824)).toBe('1.0 GB');
    expect(formatSize(2147483648)).toBe('2.0 GB');
    expect(formatSize(1610612736)).toBe('1.5 GB');
  });

  it('should handle edge cases', () => {
    expect(formatSize(0)).toBe('0.0 KB');
    expect(formatSize(1023)).toBe('1.0 KB');
    expect(formatSize(1073741823)).toBe('1024.0 MB');
  });
});

describe('formatSpeed', () => {
  it('should format speed in KB/s correctly', () => {
    expect(formatSpeed(10 * 1024)).toBe('10.00 KB/s');
    expect(formatSpeed(999.99 * 1024)).toBe('999.99 KB/s');
  });

  it('should format speed in MB/s correctly', () => {
    expect(formatSpeed(1024 * 1024)).toBe('1.00 MB/s');
    expect(formatSpeed(10240 * 1024)).toBe('10.00 MB/s');
  });

  it('should format speed in GB/s correctly', () => {
    expect(formatSpeed(1048576 * 1024)).toBe('1.00 GB/s');
    expect(formatSpeed(10485760 * 1024)).toBe('10.00 GB/s');
  });

  it('should handle edge cases', () => {
    expect(formatSpeed(0)).toBe('0.00 Byte/s');
    expect(formatSpeed(1000 * 1024)).toBe('1000.00 KB/s');
    expect(formatSpeed(1000.01 * 1024)).toBe('0.98 MB/s');
  });
});

describe('formatTime', () => {
  it('should format time in seconds correctly', () => {
    expect(formatTime(30)).toBe('30.0 s');
    expect(formatTime(59.9)).toBe('59.9 s');
  });

  it('should format time in minutes correctly', () => {
    expect(formatTime(60)).toBe('1.0 min');
    expect(formatTime(3599)).toBe('60.0 min');
  });

  it('should format time in hours correctly', () => {
    expect(formatTime(3600)).toBe('1.00 h');
    expect(formatTime(7200)).toBe('2.00 h');
  });

  it('should handle edge cases', () => {
    expect(formatTime(0)).toBe('0.0 s');
    expect(formatTime(59.99)).toBe('60.0 s');
    expect(formatTime(3599.99)).toBe('60.0 min');
  });
});

describe('formatTokenNumber', () => {
  it('should return "1K" for numbers between 1 and 1023', () => {
    expect(formatTokenNumber(500)).toBe('1K');
    expect(formatTokenNumber(1000)).toBe('1K');
  });

  it('should format numbers between 1024 and 41,983 correctly', () => {
    expect(formatTokenNumber(1024)).toBe('1K');
    expect(formatTokenNumber(2000)).toBe('2K');
    expect(formatTokenNumber(2048)).toBe('2K');
    expect(formatTokenNumber(4000)).toBe('4K');
    expect(formatTokenNumber(4096)).toBe('4K');
    expect(formatTokenNumber(32000)).toBe('32K');
    expect(formatTokenNumber(65536)).toBe('64K');
  });

  it('should format numbers between 41,984 and 127,999 correctly', () => {
    expect(formatTokenNumber(41984)).toBe('41K');
    expect(formatTokenNumber(100000)).toBe('97K');
    expect(formatTokenNumber(127999)).toBe('124K');
  });

  it('should return "128K" for 131,072', () => {
    expect(formatTokenNumber(131072)).toBe('128K'); // Qwen
  });

  it('should format numbers between 128,000 and 999,999 correctly', () => {
    expect(formatTokenNumber(128000)).toBe('128K');
    expect(formatTokenNumber(200000)).toBe('200K'); // Claude
    expect(formatTokenNumber(999999)).toBe('999K');
  });

  it('should format numbers 1,000,000 and above correctly', () => {
    expect(formatTokenNumber(1000000)).toBe('1M');
    expect(formatTokenNumber(1024000)).toBe('1M');
    expect(formatTokenNumber(1048576)).toBe('1M'); // Gemini Flash
    expect(formatTokenNumber(2000000)).toBe('2M');
    expect(formatTokenNumber(2097152)).toBe('2M'); // Gemini Pro
  });
});
