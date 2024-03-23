import { SessionStore } from '@/store/session';

const sessionGroupItems = (s: SessionStore) =>
  s.customSessionGroups.map((group) => ({
    id: group.id,
    name: group.name,
  }));

const getGroupById = (id: string) => (s: SessionStore) =>
  sessionGroupItems(s).find((group) => group.id === id);

export const sessionGroupSelectors = {
  getGroupById,
  sessionGroupItems,
};
