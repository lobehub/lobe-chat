import { SessionGroupItem } from '@/types/session';

const getGroupByName = (
  name: string,
  customGroups: SessionGroupItem[] = [],
): SessionGroupItem | undefined => {
  return customGroups.find((group) => group.name === name);
};

const getGroupById = (
  id: string,
  customGroups: SessionGroupItem[] = [],
): SessionGroupItem | undefined => {
  return customGroups.find((group) => group.id === id);
};

const removeGroup = (id: string, customGroups: SessionGroupItem[] = []): SessionGroupItem[] => {
  return customGroups.filter((group) => group.id !== id);
};

const renameGroup = (
  id: string,
  name: string,
  customGroups: SessionGroupItem[] = [],
): SessionGroupItem[] => {
  return customGroups.map((group) => {
    if (group.id === id) {
      return {
        ...group,
        name,
      };
    }
    return group;
  });
};

export const groupHelpers = {
  getGroupById,
  getGroupByName,
  removeGroup,
  renameGroup,
};
