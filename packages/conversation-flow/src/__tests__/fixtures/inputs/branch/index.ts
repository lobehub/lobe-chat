import type { Message } from '../../../../types';
import activeIndex1 from './active-index-1.json';
import conversation from './conversation.json';
import nested from './nested.json';

export const branch = {
  activeIndex1: activeIndex1 as Message[],
  conversation: conversation as Message[],
  nested: nested as Message[],
};
