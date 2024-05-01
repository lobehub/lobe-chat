import { useGlobalStore } from '@/store/global';

export const useNewVersion = () => {
  const [hasNewVersion, useCheckLatestVersion] = useGlobalStore((s) => [
    s.hasNewVersion,
    s.useCheckLatestVersion,
  ]);

  useCheckLatestVersion();

  return hasNewVersion;
};
