import { HotkeyEnum } from '@/types/hotkey';

export type UserHotkeyConfig = Record<(typeof HotkeyEnum)[keyof typeof HotkeyEnum], string>;
