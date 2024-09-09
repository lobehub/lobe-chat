import { useProviderList as useProviderListSetting } from '@/app/(main)/settings/llm/ProviderList/providers';
import { ProviderItem } from '@/app/(main)/settings/llm/type';

export const useProviderList = (providers?: string[]) => {
  const allList = useProviderListSetting();

  const allListWithLobeHub: ProviderItem[] = [
    /* ↓ cloud slot ↓ */
    /* ↑ cloud slot ↑ */
    ...allList,
  ];

  if (!providers) return allListWithLobeHub;

  return allListWithLobeHub.filter((item) => providers?.includes(item.id));
};

export const useProviderItem = (id: string) => {
  const allList = useProviderList();
  return allList.find((item) => item.id === id);
};
