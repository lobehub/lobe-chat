import { set } from 'lodash-es';

/**
 * Improved parsing function that handles numbers, booleans, semicolons, and equals signs in values.
 * @param {string} envStr - The environment variable string to be parsed.
 */
export const parseAgentConfig = (envStr: string) => {
  const config = {};

  envStr.split(';').forEach((entry) => {
    const firstEqualIndex = entry.indexOf('=');
    if (firstEqualIndex === -1) return;

    const key = entry.slice(0, Math.max(0, firstEqualIndex));
    let value = entry.slice(Math.max(0, firstEqualIndex + 1));
    if (!key || !value) return;

    let finalValue: any = value;

    // Handle numeric values
    if (!isNaN(value as any)) {
      finalValue = Number(value);
    }
    // Handle boolean values
    else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      finalValue = value.toLowerCase() === 'true';
    }
    // Handle arrays
    else if (value.includes(',') || value.includes('，')) {
      const array = value.replaceAll('，', ',').split(',');
      finalValue = array.map((item) => (isNaN(item as any) ? item : Number(item)));
    }

    set(config, key, finalValue);
  });

  return config;
};
