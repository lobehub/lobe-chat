import { describe, expect, it } from 'vitest';

import { ChatModelCard } from '@/types/llm';

import {
  AddCustomModelCard,
  DeleteCustomModelCard,
  UpdateCustomModelCard,
  customModelCardsReducer,
} from './customModelCard';

describe('customModelCardsReducer', () => {
  const initialState: ChatModelCard[] = [
    {
      id: 'model1',
      displayName: 'Model 1',
      description: 'A helpful assistant',
      files: true,
      functionCall: false,
      enabled: true,
      isCustom: true,
      legacy: false,
      maxOutput: 1000,
      tokens: 2048,
      vision: false,
    },
    {
      id: 'model2',
      displayName: 'Model 2',
      description: 'A friendly chatbot',
      files: false,
      functionCall: true,
      isCustom: true,
      legacy: true,
      maxOutput: 500,
      tokens: 1024,
      vision: true,
    },
  ];

  it('should add a new custom model card', () => {
    const newModelCard: ChatModelCard = {
      id: 'model3',
      displayName: 'Model 3',
      description: 'A versatile assistant',
      files: true,
      functionCall: true,
      enabled: true,
      isCustom: true,
      legacy: false,
      maxOutput: 2000,
      tokens: 4096,
      vision: false,
    };

    const action: AddCustomModelCard = {
      type: 'add',
      modelCard: newModelCard,
    };

    const newState = customModelCardsReducer(initialState, action);

    expect(newState).toContainEqual(newModelCard);
    expect(newState.length).toBe(initialState.length + 1);
  });

  it('should not add a duplicate custom model card', () => {
    const duplicateModelCard: ChatModelCard = {
      id: 'model1',
      displayName: 'Duplicate Model 1',
      description: 'A duplicate model',
      files: true,
      functionCall: false,
      enabled: true,
      isCustom: true,
      legacy: false,
      maxOutput: 1000,
      tokens: 2048,
      vision: false,
    };

    const action: AddCustomModelCard = {
      type: 'add',
      modelCard: duplicateModelCard,
    };

    const newState = customModelCardsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should delete a custom model card', () => {
    const action: DeleteCustomModelCard = {
      type: 'delete',
      id: 'model1',
    };

    const newState = customModelCardsReducer(initialState, action);

    expect(newState).not.toContainEqual(initialState[0]);
    expect(newState.length).toBe(initialState.length - 1);
  });

  it('should update a custom model card', () => {
    const action: UpdateCustomModelCard = {
      type: 'update',
      id: 'model1',
      value: { displayName: 'Updated Model 1' },
    };

    const newState = customModelCardsReducer(initialState, action);

    expect(newState.find((card) => card.id === 'model1')?.displayName).toBe('Updated Model 1');
    expect(newState.length).toBe(initialState.length);
  });

  it('should throw an error for unhandled action type', () => {
    const invalidAction = {
      type: 'invalid',
    };

    expect(() => customModelCardsReducer(initialState, invalidAction as any)).toThrowError(
      'Unhandled action type in customModelCardsReducer',
    );
  });

  it('should return the original state if the model card is not found during update', () => {
    const action: UpdateCustomModelCard = {
      type: 'update',
      id: 'nonexistent',
      value: { displayName: 'Updated Nonexistent Model' },
    };

    const newState = customModelCardsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should return the original state if the model card ID is missing during add', () => {
    const newModelCard: ChatModelCard = {
      id: '',
      displayName: 'Model 4',
      description: 'A new model',
      files: false,
      functionCall: false,
      enabled: true,
      isCustom: true,
      legacy: false,
      maxOutput: 1500,
      tokens: 2048,
      vision: false,
    };

    const action: AddCustomModelCard = {
      type: 'add',
      modelCard: newModelCard,
    };

    const newState = customModelCardsReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should handle optional properties correctly', () => {
    const newModelCard: ChatModelCard = {
      id: 'model4',
    };

    const action: AddCustomModelCard = {
      type: 'add',
      modelCard: newModelCard,
    };

    const newState = customModelCardsReducer(initialState, action);

    expect(newState).toContainEqual(newModelCard);
  });

  it('should handle an undefined initial state', () => {
    const newModelCard: ChatModelCard = {
      id: 'model4',
      displayName: 'Model 4',
      description: 'A new model',
      files: false,
      functionCall: false,
      enabled: true,
      isCustom: true,
      legacy: false,
      maxOutput: 1500,
      tokens: 2048,
      vision: false,
    };

    const action: AddCustomModelCard = {
      type: 'add',
      modelCard: newModelCard,
    };

    const newState = customModelCardsReducer(undefined, action);

    expect(newState).toContainEqual(newModelCard);
    expect(newState.length).toBe(1);
  });
});
