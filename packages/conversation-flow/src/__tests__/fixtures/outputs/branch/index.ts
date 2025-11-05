import type { SerializedParseResult } from '../..';
import activeIndex1 from './active-index-1.json';
import conversation from './conversation.json';
import nested from './nested.json';

export const branch = {
  activeIndex1: activeIndex1 as unknown as SerializedParseResult,
  conversation: conversation as unknown as SerializedParseResult,
  nested: nested as unknown as SerializedParseResult,
};
