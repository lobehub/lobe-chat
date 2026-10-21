import { LOADING_FLAT } from '@lobechat/const';

interface TopicMessageLike {
  content?: string | null;
  reasoning?: { content?: string | null } | null;
  role: string;
  tools?: unknown[] | null;
}

const USER_MAX = 1024;

const hasText = (content?: string | null): content is string =>
  !!content?.trim() && content !== LOADING_FLAT;

/**
 * User messages at the end of a topic that no reply followed.
 *
 * A resumed CLI session knows only the turns the CLI wrote to its own
 * transcript. When the user stops a run before the CLI records the prompt
 * (Claude Code writes it about half a second after reading it), the prompt
 * exists only in LobeHub, and the next turn resumes a session that never saw
 * it. Any output from the stopped run (text, reasoning, a tool call) proves the
 * CLI read the prompt, so only messages with nothing after them are returned.
 *
 * A stop that lands before the server accepts the message restores the draft,
 * so the user often re-sends the same text: copies of `currentPrompt` and
 * repeats are dropped.
 *
 * `messages` must be in chronological order and exclude the current turn.
 */
export const collectUnansweredUserTurns = (
  messages: TopicMessageLike[],
  currentPrompt?: string,
): string[] => {
  let pending: string[] = [];

  for (const m of messages) {
    if (m.role === 'user') {
      if (hasText(m.content)) pending.push(m.content);
      continue;
    }

    const answered =
      m.role === 'tool' ||
      (m.role === 'assistant' &&
        (hasText(m.content) || hasText(m.reasoning?.content) || (m.tools?.length ?? 0) > 0));
    if (answered) pending = [];
  }

  const seen = new Set([currentPrompt?.trim()]);
  return pending.filter((content) => {
    const key = content.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * System-context section that re-delivers unanswered user messages to a
 * resumed session. Returns `undefined` when there is nothing to deliver.
 */
export const formatUnansweredUserTurns = (turns?: string[]): string | undefined => {
  if (!turns || turns.length === 0) return;

  const entries = turns.map((content) => {
    const body = content.length > USER_MAX ? `${content.slice(0, USER_MAX)}… [truncated]` : content;
    return `<user>\n${body}\n</user>`;
  });

  return [
    '<unanswered_user_messages>',
    'The user sent these messages earlier in this conversation, but the run that should have answered them ended before you replied, so your session history may not contain them. Read them as context for the current message.',
    ...entries,
    '</unanswered_user_messages>',
  ].join('\n');
};
