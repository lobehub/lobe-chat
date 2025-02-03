import { parseAsBoolean, useQueryState } from 'nuqs';

export const useShowMobileWorkspace = () => {
  const [showMobileWorkspace] = useQueryState('showMobileWorkspace', parseAsBoolean);

  return showMobileWorkspace;
};
