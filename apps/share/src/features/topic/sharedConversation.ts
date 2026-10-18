import { CLIENT_VERSION_HEADER, CURRENT_VERSION } from '@lobechat/const';
import { type ConversationContext } from '@lobechat/types';
import superjson, { type SuperJSONResult } from 'superjson';

import {
  primeMessageListPage,
  type RoundCursorQueryResult,
  toMessageListPage,
  toRoundCursorQueryInput,
} from '@/services/message/roundCursorPage';
import { type SharedTopicData } from '@/types/topic';

type SharedTopicTarget = Pick<SharedTopicData, 'agentId' | 'groupId' | 'shareId' | 'topicId'>;

interface DocumentSharedTopicMessages {
  response: Promise<unknown>;
  shareId: string;
}

declare global {
  interface Window {
    __LOBE_SHARED_TOPIC_MESSAGES__?: DocumentSharedTopicMessages;
  }
}

/**
 * The conversation a share link shows. The rendered list and the primed read
 * must build it identically, or the list misses the primed page and asks again.
 */
export const toSharedConversationContext = (topic: SharedTopicTarget): ConversationContext => ({
  agentId: topic.agentId ?? '',
  groupId: topic.groupId ?? undefined,
  topicId: topic.topicId,
  topicShareId: topic.shareId,
});

/** The list's first read of the share, as the unbatched tRPC GET the lambda route serves. */
export const sharedTopicMessagesUrl = (topic: SharedTopicTarget) => {
  const input = superjson.serialize(
    toRoundCursorQueryInput(toSharedConversationContext(topic), null),
  );

  return `/trpc/lambda/message.getMessagesByCursor?input=${encodeURIComponent(JSON.stringify(input))}`;
};

// `shareId` comes from the URL: escape everything that could end the script.
const toScriptLiteral = (value: string) =>
  JSON.stringify(value)
    .replaceAll('<', String.raw`\u003c`)
    .replaceAll('\u2028', String.raw`\u2028`)
    .replaceAll('\u2029', String.raw`\u2029`);

/**
 * An inline script that requests the share's newest messages while the document
 * parses, alongside the module downloads instead of after them. Empty for a
 * share the list would not read: it only reads a conversation it can attribute
 * to an agent (`useFetchMessages`).
 */
export const sharedTopicMessagesScript = (topic: SharedTopicTarget) => {
  if (!topic.agentId) return '';

  const url = toScriptLiteral(sharedTopicMessagesUrl(topic));
  const headers = `{${toScriptLiteral(CLIENT_VERSION_HEADER)}:${toScriptLiteral(CURRENT_VERSION)}}`;

  return [
    `var r=fetch(${url},{credentials:'include',headers:${headers}})`,
    `.then(function(res){if(!res.ok)throw new Error(res.status);return res.json()});`,
    `r.catch(function(){});`,
    `window.__LOBE_SHARED_TOPIC_MESSAGES__={response:r,shareId:${toScriptLiteral(topic.shareId)}};`,
  ].join('');
};

const takeDocumentSharedTopicMessages = (shareId: string) => {
  const started = window.__LOBE_SHARED_TOPIC_MESSAGES__;
  if (started?.shareId !== shareId) return;

  delete window.__LOBE_SHARED_TOPIC_MESSAGES__;

  return started.response.then((body) =>
    toMessageListPage(
      superjson.deserialize<RoundCursorQueryResult>(
        (body as { result: { data: SuperJSONResult } }).result.data,
      ),
    ),
  );
};

/**
 * Hand the messages the document started reading to the list, so they arrive
 * while the conversation chunks are still downloading instead of after they
 * mount. Taken once: a later navigation's list reads for itself.
 */
export const primeSharedTopicMessages = (topic: SharedTopicTarget) => {
  const page = takeDocumentSharedTopicMessages(topic.shareId);
  if (!page) return;

  primeMessageListPage(toSharedConversationContext(topic), page);
};
