import { redirect } from 'next/navigation';
import qs from 'query-string';

/**
 * @description: Chat Settings Modal (intercepting routes fallback when hard refresh)
 * @example: /chat/settings/modal?tab=prompt => /chat/settings
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */

const ChatSettingsModalFallback = ({ searchParams }: { searchParams: any }) => {
  const { tab, ...query } = searchParams;
  return redirect(
    [qs.stringifyUrl({ query: query, url: '/chat/settings' }), tab].filter(Boolean).join('#'),
  );
};

export default ChatSettingsModalFallback;
