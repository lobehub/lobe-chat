import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fileService } from '@/services/file';
import { imageGenerationService } from '@/services/textToImage';
import { legacyUploadService as uploadService } from '@/services/upload_legacy';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';
import { DallEImageItem } from '@/types/tool/dalle';

import { useChatStore } from '../../store';

describe('chatToolSlice', () => {
  describe('generateImageFromPrompts', () => {
    it('should generate images from prompts, update items, and upload images', async () => {
      const { result } = renderHook(() => useChatStore());

      const initialMessageContent = JSON.stringify([
        { prompt: 'test prompt', previewUrl: 'old-url', imageId: 'old-id' },
      ]);

      vi.spyOn(chatSelectors, 'getMessageById').mockImplementationOnce(
        (id) => () =>
          ({
            id,
            content: initialMessageContent,
          }) as ChatMessage,
      );

      const messageId = 'message-id';
      const prompts = [
        { prompt: 'test prompt 1' },
        { prompt: 'test prompt 2' },
      ] as DallEImageItem[];
      const mockUrl = 'https://example.com/image.png';
      const mockId = 'image-id';

      vi.spyOn(imageGenerationService, 'generateImage').mockResolvedValue(mockUrl);
      vi.spyOn(uploadService, 'uploadImageByUrl').mockResolvedValue({} as any);
      vi.spyOn(fileService, 'createFile').mockResolvedValue({ id: mockId, url: '' });
      vi.spyOn(result.current, 'toggleDallEImageLoading');

      await act(async () => {
        await result.current.generateImageFromPrompts(prompts, messageId);
      });
      // For each prompt, loading is toggled on and then off
      expect(imageGenerationService.generateImage).toHaveBeenCalledTimes(prompts.length);
      expect(uploadService.uploadImageByUrl).toHaveBeenCalledTimes(prompts.length);

      expect(result.current.toggleDallEImageLoading).toHaveBeenCalledTimes(prompts.length * 2);
    });
  });

  describe('updateImageItem', () => {
    it('should update image item correctly', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const initialMessageContent = JSON.stringify([
        { prompt: 'test prompt', previewUrl: 'old-url', imageId: 'old-id' },
      ]);
      const updateFunction = (draft: any) => {
        draft[0].previewUrl = 'new-url';
        draft[0].imageId = 'new-id';
      };
      vi.spyOn(result.current, 'internal_updateMessageContent');

      // 模拟 getMessageById 返回消息内容
      vi.spyOn(chatSelectors, 'getMessageById').mockImplementationOnce(
        (id) => () =>
          ({
            id,
            content: initialMessageContent,
          }) as ChatMessage,
      );

      await act(async () => {
        await result.current.updateImageItem(messageId, updateFunction);
      });

      // 验证 internal_updateMessageContent 是否被正确调用以更新内容
      expect(result.current.internal_updateMessageContent).toHaveBeenCalledWith(
        messageId,
        JSON.stringify([{ prompt: 'test prompt', previewUrl: 'new-url', imageId: 'new-id' }]),
      );
    });
  });

  describe('text2image', () => {
    it('should call generateImageFromPrompts with provided data', async () => {
      const { result } = renderHook(() => useChatStore());
      const id = 'message-id';
      const data = [{ prompt: 'prompt 1' }, { prompt: 'prompt 2' }] as DallEImageItem[];

      // Mock generateImageFromPrompts
      const generateImageFromPromptsMock = vi.spyOn(result.current, 'generateImageFromPrompts');

      await act(async () => {
        await result.current.text2image(id, data);
      });

      expect(generateImageFromPromptsMock).toHaveBeenCalledWith(data, id);
    });
  });
});
