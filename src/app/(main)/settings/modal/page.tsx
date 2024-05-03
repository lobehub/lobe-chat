/**
 * @description: Settings Modal (intercepting routes fallback when hard refresh)
 * @example: /settings/modal?tab=common => /settings/common
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */
import { redirect } from 'next/navigation';
import urlJoin from 'url-join';

import { SettingsTabs } from '@/store/global/initialState';

const SettingsModalFallback = ({ searchParams }: { searchParams: { tab: SettingsTabs } }) => {
  return redirect(urlJoin('/settings', searchParams.tab));
};

export default SettingsModalFallback;
