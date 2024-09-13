export const formatSize = (bytes: number, fractionDigits = 1): string => {
  const kbSize = bytes / 1024;
  if (kbSize < 1024) {
    return `${kbSize.toFixed(fractionDigits)} KB`;
  } else if (kbSize < 1_048_576) {
    const mbSize = kbSize / 1024;
    return `${mbSize.toFixed(fractionDigits)} MB`;
  } else {
    const gbSize = kbSize / 1_048_576;
    return `${gbSize.toFixed(fractionDigits)} GB`;
  }
};

/**
 * format speed from Byte number to string like KB/s, MB/s or GB/s
 */
export const formatSpeed = (byte: number, fractionDigits = 2) => {
  let word = '';

  // Byte
  if (byte <= 1000) {
    word = byte.toFixed(fractionDigits) + ' Byte/s';
  }
  // KB
  else if (byte / 1024 <= 1000) {
    word = (byte / 1024).toFixed(fractionDigits) + ' KB/s';
  }
  // MB
  else if (byte / 1024 / 1024 <= 1000) {
    word = (byte / 1024 / 1024).toFixed(fractionDigits) + ' MB/s';
  }
  // GB
  else {
    word = (byte / 1024 / 1024 / 1024).toFixed(fractionDigits) + ' GB/s';
  }

  return word;
};

export const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds < 60) {
    return `${timeInSeconds.toFixed(1)} s`;
  } else if (timeInSeconds < 3600) {
    return `${(timeInSeconds / 60).toFixed(1)} min`;
  } else {
    return `${(timeInSeconds / 3600).toFixed(2)} h`;
  }
};

/**
 * format number with comma
 * @param num
 */
export const formatNumber = (num: any) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatTokenNumber = (num: number): string => {
  if (num > 0 && num < 1024) return '1K';

  let kiloToken = Math.floor(num / 1024);
  if ((num >= 1024 && num < 1024 * 41) || num >= 128_000) {
    kiloToken = Math.floor(num / 1000);
  }
  if (num === 131_072) return '128K';
  return kiloToken < 1000 ? `${kiloToken}K` : `${Math.floor(kiloToken / 1000)}M`;
};
