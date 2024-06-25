import { describe, expect, it } from 'vitest';

import { formatSize, formatSpeed, formatTime } from './format';

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
