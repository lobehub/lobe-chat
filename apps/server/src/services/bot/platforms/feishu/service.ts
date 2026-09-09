import type {
  CreatePollParams,
  CreatePollState,
  CreateThreadParams,
  CreateThreadState,
  DeleteMessageParams,
  DeleteMessageState,
  EditMessageParams,
  EditMessageState,
  GetChannelInfoParams,
  GetChannelInfoState,
  GetMemberInfoParams,
  GetMemberInfoState,
  GetReactionsParams,
  GetReactionsState,
  ListChannelsParams,
  ListChannelsState,
  ListPinsParams,
  ListPinsState,
  ListThreadsParams,
  ListThreadsState,
  MessageItem,
  PinMessageParams,
  PinMessageState,
  ReactToMessageParams,
  ReactToMessageState,
  ReadMessagesParams,
  ReadMessagesState,
  ReplyToThreadParams,
  ReplyToThreadState,
  SearchMessagesParams,
  SearchMessagesState,
  SendMessageParams,
  SendMessageState,
  UnpinMessageParams,
  UnpinMessageState,
} from '@lobechat/builtin-tool-message/executionRuntime';
import type { LarkApiClient } from '@lobechat/chat-adapter-feishu';
import { supportedFeishuEmojiTypes, toFeishuEmojiType } from '@lobechat/chat-adapter-feishu';
import { DEFAULT_BOT_HISTORY_LIMIT } from '@lobechat/const';

import type { MessageRuntimeService } from '@/server/services/toolExecution/serverRuntimes/message/adapters/types';
import { PlatformUnsupportedError } from '@/server/services/toolExecution/serverRuntimes/message/PlatformUnsupportedError';

import { MAX_FEISHU_HISTORY_LIMIT } from './const';
import { sendFeishuAttachments } from './sendAttachments';

/**
 * Feishu/Lark error codes that make a history read fail for a *configuration*
 * reason rather than a transient one, mapped to the action that fixes them.
 *
 * `LarkApiClient` surfaces failures as `Lark API GET /im/v1/messages failed:
 * 230027 Permission denied` — accurate but useless to the model, which then
 * relays a bare code to the user. `im:message.group_msg` in particular is easy
 * to miss: it's needed *on top of* `im:message:readonly` for group history, so
 * a bot that sends and receives fine still can't read the backlog.
 *
 * See `protocol-spec.md` §4.5.
 */
const HISTORY_READ_ERROR_HINTS: Record<string, string> = {
  '230002': 'the bot is not a member of this chat — add it to the group first',
  '230006':
    'the bot capability is not enabled for this app — enable it in the Feishu/Lark developer console',
  // Name the scope the way the console lists it. The console's permission
  // search matches the Chinese display name, so a bare code sends the operator
  // hunting; and the neighbouring `im:message.group_msg.include_bot:read`
  // ("获取群组中用户和机器人发送的消息") is a different scope that governs the
  // receive-message event, not history reads — easy to grab by mistake.
  '230027':
    'the app lacks permission to read this chat history. Reading GROUP history requires the scope "获取群组中所有消息" (`im:message.group_msg`) IN ADDITION TO `im:message:readonly` — add it under 权限管理 in the developer console (it is 免审, but you must then 创建版本 and 发布 for it to take effect). Note this is not `im:message.group_msg.include_bot:read`, which only governs the receive-message event',
  '230073': 'this topic is not visible to the bot',
};

/**
 * Turn a raw Lark API failure into a message the model can act on, leaving
 * anything unrecognized untouched so genuine/unknown errors stay debuggable.
 */
const explainHistoryReadError = (error: unknown): Error => {
  const message = error instanceof Error ? error.message : String(error);
  const code = Object.keys(HISTORY_READ_ERROR_HINTS).find((c) => message.includes(c));
  if (!code) return error instanceof Error ? error : new Error(message);
  return new Error(`${message} — ${HISTORY_READ_ERROR_HINTS[code]}.`);
};

/**
 * Normalize a Feishu/Lark message object to MessageItem.
 */
const toMessageItem = (msg: any): MessageItem => {
  let content: string;
  try {
    const parsed = JSON.parse(msg.body?.content ?? '{}');
    content = parsed.text ?? '';
  } catch {
    content = msg.body?.content ?? '';
  }

  return {
    author: {
      id: msg.sender?.id ?? '',
      name: msg.sender?.sender_type === 'user' ? (msg.sender?.id ?? 'User') : 'Bot',
    },
    content,
    id: msg.message_id ?? '',
    replyTo: msg.parent_id ?? msg.root_id ?? undefined,
    timestamp: msg.create_time
      ? new Date(Number(msg.create_time)).toISOString()
      : new Date().toISOString(),
  };
};

export class FeishuMessageService implements MessageRuntimeService {
  private platformName: string;

  constructor(
    private api: LarkApiClient,
    platformName: 'feishu' | 'lark' = 'feishu',
  ) {
    this.platformName = platformName;
  }

  // ==================== Core Message Operations ====================

  sendMessage = async (params: SendMessageParams): Promise<SendMessageState> => {
    // Lark/Feishu has no composite "text + media" message, so the text leg
    // ships first (so the user reads context before media) and each
    // attachment becomes its own follow-up message.
    let messageId: string | undefined;
    if (params.content?.trim()) {
      const result = await this.api.sendMessage(params.channelId, params.content);
      messageId = result.messageId;
    }
    if (params.attachments?.length) {
      await sendFeishuAttachments(this.api, params.channelId, params.attachments);
    }
    return {
      channelId: params.channelId,
      messageId,
      platform: this.platformName,
    };
  };

  readMessages = async (params: ReadMessagesParams): Promise<ReadMessagesState> => {
    // Feishu defaults to `ByCreateTimeAsc`, so an unsorted first page is the
    // OLDEST messages in the chat — in any group past the 50-message cap the
    // model would get the chat's beginnings instead of what was just said.
    // Ask for newest-first, then flip the page so the tool's documented
    // chronological order holds within the window. The same `sortType` goes on
    // every cursor follow-up because Feishu requires it to stay constant.
    const result = await this.api
      .listMessages(params.channelId, {
        endTime: params.endTime,
        pageSize: Math.min(params.limit ?? DEFAULT_BOT_HISTORY_LIMIT, MAX_FEISHU_HISTORY_LIMIT),
        pageToken: params.cursor,
        sortType: 'ByCreateTimeDesc',
        startTime: params.startTime,
      })
      .catch((error) => {
        throw explainHistoryReadError(error);
      });
    const messages = result.items.map(toMessageItem).reverse();
    return {
      channelId: params.channelId,
      hasMore: result.hasMore,
      messages,
      nextCursor: result.pageToken,
      platform: this.platformName,
      totalFetched: messages.length,
    };
  };

  editMessage = async (params: EditMessageParams): Promise<EditMessageState> => {
    await this.api.editMessage(params.messageId, params.content);
    return { messageId: params.messageId, success: true };
  };

  deleteMessage = async (params: DeleteMessageParams): Promise<DeleteMessageState> => {
    await this.api.deleteMessage(params.messageId);
    return { messageId: params.messageId, success: true };
  };

  searchMessages = async (_params: SearchMessagesParams): Promise<SearchMessagesState> => {
    throw new PlatformUnsupportedError(this.platformName, 'searchMessages');
  };

  // ==================== Reactions ====================

  reactToMessage = async (params: ReactToMessageParams): Promise<ReactToMessageState> => {
    // The tool schema asks for unicode because every other platform takes it;
    // Feishu takes a named `emoji_type` (see `./reactionEmoji`). Unlike the
    // bridge's fire-and-forget progress reactions, a tool call must not fail
    // silently — tell the model which names exist so it can pick another.
    const emojiType = toFeishuEmojiType(params.emoji);
    if (!emojiType) {
      throw new Error(
        `${this.platformName} has no reaction matching "${params.emoji}". ` +
          `It accepts a fixed emoji set, named rather than unicode: ${supportedFeishuEmojiTypes().join(', ')}.`,
      );
    }
    await this.api.addReaction(params.messageId, emojiType);
    return { messageId: params.messageId, success: true };
  };

  getReactions = async (_params: GetReactionsParams): Promise<GetReactionsState> => {
    throw new PlatformUnsupportedError(this.platformName, 'getReactions');
  };

  // ==================== Pin Management ====================

  pinMessage = async (_params: PinMessageParams): Promise<PinMessageState> => {
    throw new PlatformUnsupportedError(this.platformName, 'pinMessage');
  };

  unpinMessage = async (_params: UnpinMessageParams): Promise<UnpinMessageState> => {
    throw new PlatformUnsupportedError(this.platformName, 'unpinMessage');
  };

  listPins = async (_params: ListPinsParams): Promise<ListPinsState> => {
    throw new PlatformUnsupportedError(this.platformName, 'listPins');
  };

  // ==================== Channel Management ====================

  getChannelInfo = async (params: GetChannelInfoParams): Promise<GetChannelInfoState> => {
    const chat = await this.api.getChatInfo(params.channelId);
    return {
      description: chat.description ?? undefined,
      id: params.channelId,
      memberCount: chat.user_count ?? undefined,
      name: chat.name ?? undefined,
      type: chat.chat_mode ?? 'group',
    };
  };

  listChannels = async (_params: ListChannelsParams): Promise<ListChannelsState> => {
    throw new PlatformUnsupportedError(this.platformName, 'listChannels');
  };

  // ==================== Member Information ====================

  getMemberInfo = async (params: GetMemberInfoParams): Promise<GetMemberInfoState> => {
    const user = await this.api.getUserInfo(params.memberId);
    return {
      displayName: user?.name ?? undefined,
      id: params.memberId,
      username: user?.name ?? undefined,
    };
  };

  // ==================== Thread Operations ====================

  createThread = async (_params: CreateThreadParams): Promise<CreateThreadState> => {
    throw new PlatformUnsupportedError(this.platformName, 'createThread');
  };

  listThreads = async (_params: ListThreadsParams): Promise<ListThreadsState> => {
    throw new PlatformUnsupportedError(this.platformName, 'listThreads');
  };

  replyToThread = async (params: ReplyToThreadParams): Promise<ReplyToThreadState> => {
    const result = await this.api.replyMessage(params.threadId, params.content);
    return { messageId: result.messageId, threadId: params.threadId };
  };

  // ==================== Platform-Specific: Polls ====================

  createPoll = async (_params: CreatePollParams): Promise<CreatePollState> => {
    throw new PlatformUnsupportedError(this.platformName, 'createPoll');
  };
}
