import type { electronGitService } from '@/services/electron/git';
import { desktopOnly } from '@/utils/desktopOnly';

export const localGitService = desktopOnly<typeof electronGitService>('electronGitService');
