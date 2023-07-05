import { beforeEach, describe, expect, it } from 'vitest';

import { ChatMessage } from '@/types/chatMessage';

import { MessageDispatch, messagesReducer } from './messageReducer';

describe('messagesReducer', () => {
  let initialState: ChatMessage[];

  beforeEach(() => {
    initialState = [
      { content: 'Hello!', role: 'user' },
      { content: 'Hi there!', role: 'assistant' },
    ];
  });

  it('should add a message', () => {
    const newMessage: ChatMessage = { content: 'How are you?', role: 'user' };
    const action: MessageDispatch = { message: newMessage, type: 'addMessage' };
    const newState = messagesReducer(initialState, action);
    expect(newState).toEqual([...initialState, newMessage]);
  });

  it('should delete a message', () => {
    const action: MessageDispatch = { index: 1, type: 'deleteMessage' };
    const newState = messagesReducer(initialState, action);
    expect(newState).toEqual([{ content: 'Hello!', role: 'user' }]);
  });

  it('should update a message', () => {
    const action: MessageDispatch = { index: 1, message: 'I am fine!', type: 'updateMessage' };
    const newState = messagesReducer(initialState, action);
    expect(newState).toEqual([
      { content: 'Hello!', role: 'user' },
      { content: 'I am fine!', role: 'assistant' },
    ]);
  });

  it('should add a user message', () => {
    const action: MessageDispatch = { message: 'Goodbye!', type: 'addUserMessage' };
    const newState = messagesReducer(initialState, action);
    expect(newState).toEqual([
      { content: 'Hello!', role: 'user' },
      { content: 'Hi there!', role: 'assistant' },
      { content: 'Goodbye!', role: 'user' },
    ]);
  });

  it('should set error message correctly', () => {
    const action: MessageDispatch = {
      error: { message: 'Not Found', status: 404, type: 'chatbot' },
      index: 0,
      type: 'setErrorMessage',
    };
    const newState = messagesReducer(initialState, action);
    expect(newState).toEqual([
      {
        content: 'Hello!',
        error: { message: 'Not Found', status: 404, type: 'chatbot' },
        role: 'user',
      },
      { content: 'Hi there!', role: 'assistant' },
    ]);
  });

  it('should update the latest bot message', () => {
    const responseStream = ['I', ' am', ' a', ' bot.'];
    const action: MessageDispatch = { responseStream, type: 'updateLatestBotMessage' };
    const newState = messagesReducer(initialState, action);
    expect(newState).toEqual([
      { content: 'Hello!', role: 'user' },
      { content: 'I am a bot.', role: 'assistant' },
    ]);
  });
});
