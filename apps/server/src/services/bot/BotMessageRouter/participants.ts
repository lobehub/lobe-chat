import type { Chat, Message } from 'chat';
import debug from 'debug';

const log = debug('lobe-server:bot:message-router');

// single-user thread relaxation. A subscribed channel thread
// with only one human follower is effectively a private 1:1 with the
// bot, so we drop the @mention requirement for follow-ups. Once a
// second human posts we revert to mention-only mode and announce the
// switch once so participants understand why the bot went quiet.
// Mirrors `MessengerRouter`'s implementation — see that file for the
// shared rationale.
export const PARTICIPANTS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const participantsKey = (threadId: string): string => `messenger:thread-humans:${threadId}`;
export const mentionRequiredAnnouncedKey = (threadId: string): string =>
  `messenger:thread-mention-required-announced:${threadId}`;

/**
 * Track the distinct humans who have spoken in a subscribed thread, stored in
 * the bot's chat-sdk state. Returns `trackThreadParticipants`, which folds a
 * debounced batch into one count.
 */
export const createParticipantTracker = (bot: Chat<any>) => {
  const trackThreadParticipant = async (
    thread: { id: string; isDM?: boolean },
    message: Message,
  ): Promise<{ count: number; isNewParticipant: boolean }> => {
    if (thread.isDM) return { count: 0, isNewParticipant: false };
    const senderId = message.author?.userId;
    const isHuman =
      !!senderId &&
      message.author?.isBot !== true &&
      (message.author as { isMe?: boolean })?.isMe !== true;
    if (!isHuman) return { count: 0, isNewParticipant: false };

    const stateAdapter = bot.getState();
    const key = participantsKey(thread.id);
    let participants: string[] = [];
    try {
      participants = (await stateAdapter.getList<string>(key)) ?? [];
    } catch (error) {
      log('trackThreadParticipant: getList failed: %O', error);
    }
    if (participants.includes(senderId)) {
      return { count: participants.length, isNewParticipant: false };
    }
    try {
      await stateAdapter.appendToList(key, senderId, {
        maxLength: 50,
        ttlMs: PARTICIPANTS_TTL_MS,
      });
    } catch (error) {
      log('trackThreadParticipant: appendToList failed: %O', error);
    }
    return { count: participants.length + 1, isNewParticipant: true };
  };

  const trackThreadParticipants = async (
    thread: { id: string; isDM?: boolean },
    messages: readonly Message[],
  ): Promise<{ count: number; isNewParticipant: boolean }> => {
    let count = 0;
    let isNewParticipant = false;
    for (const candidate of messages) {
      const tracked = await trackThreadParticipant(thread, candidate);
      count = Math.max(count, tracked.count);
      isNewParticipant ||= tracked.isNewParticipant;
    }
    return { count, isNewParticipant };
  };

  return trackThreadParticipants;
};
