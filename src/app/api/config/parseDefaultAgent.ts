import { set } from 'lodash-es';
import { DeepPartial } from 'utility-types';

import { LobeAgentConfig } from '@/types/agent';

/**
 * Parses a string of environment variables and converts it into a structured configuration object.
 * It automatically converts values containing commas (either English or Chinese) into arrays.
 *
 * @param {string} envStr - The environment variable string to be parsed.
 */
export const parseAgentConfig = (envStr: string): DeepPartial<LobeAgentConfig> => {
  if (!envStr) return {};

  const config: DeepPartial<LobeAgentConfig> = {};

  // Split the environment variable string into individual entries based on the semicolon separator.
  const entries = envStr.split(';');

  for (const entry of entries) {
    if (!entry) continue;

    let [key, value] = entry.split('=');
    if (!key || !value) continue;

    let finalValue: any = value;

    // Check if the value contains either English or Chinese commas, and convert to an array if so.
    // This replaces all Chinese commas with English ones, then splits the string into an array.
    if (value.includes(',') || value.includes('，')) {
      finalValue = value.replaceAll('，', ',').split(',') as string[];
    }

    // Use lodash `set` to handle nested configuration by setting the value at the path specified by the key.
    set(config, key, finalValue);
  }

  return config;
};
