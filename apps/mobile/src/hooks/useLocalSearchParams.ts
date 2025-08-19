import { useLocalSearchParams as _useLocalSearchParams } from 'expo-router';

export function useLocalSearchParams<T extends Record<string, string>>() {
  const params = _useLocalSearchParams<T>();

  for (const [key, value] of Object.entries(params)) {
    if (value === 'undefined' || value === 'null') {
      delete params[key];
    }
  }

  return params;
}
