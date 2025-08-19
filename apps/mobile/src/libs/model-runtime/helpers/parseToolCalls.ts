import { produce } from 'immer';

import { MessageToolCall, MessageToolCallChunk, MessageToolCallSchema } from '@/types/message';

export const parseToolCalls = (origin: MessageToolCall[], value: MessageToolCallChunk[]) =>
  produce(origin, (draft) => {
    // if there is no origin, we should parse all the value and set it to draft
    if (draft.length === 0) {
      draft.push(...value.map((item) => MessageToolCallSchema.parse(item)));
      return;
    }

    // if there is origin, we should merge the value to the origin
    value.forEach(({ index, ...item }) => {
      if (!draft?.[index]) {
        // if not, we should insert it to the draft
        draft?.splice(index, 0, MessageToolCallSchema.parse(item));
      } else {
        // if it is already in the draft, we should merge the arguments to the draft
        if (item.function?.arguments) {
          draft[index].function.arguments += item.function.arguments;
        }
      }
    });
  });
