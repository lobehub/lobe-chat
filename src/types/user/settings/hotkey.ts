import { HotkeyEnum } from '@/types/hotkey';

export type UserHotkeyConfig = Record<keyof typeof HotkeyEnum, string>;
