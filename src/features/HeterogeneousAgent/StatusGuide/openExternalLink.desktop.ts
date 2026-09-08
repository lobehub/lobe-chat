import { electronSystemService } from '@/services/electron/system';

export const openExternalLink = async (url: string): Promise<void> => {
  await electronSystemService.openExternalLink(url);
};
