import { act, renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileService } from '@/services/file';
import { createServerConfigStore } from '@/store/serverConfig/store';

import { useFileStore as useStore } from '../../store';

vi.mock('zustand/traditional');

// Mock for useSWR
vi.mock('swr', () => ({
  default: vi.fn(),
}));

//  mock the arrayBuffer
beforeAll(() => {
  Object.defineProperty(File.prototype, 'arrayBuffer', {
    writable: true,
    value: function () {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsArrayBuffer(this);
      });
    },
  });

  createServerConfigStore();
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.resetAllMocks();
});

describe('TTSFileAction', () => {
  // Test for removeTTSFile
  it('removeTTSFile should call fileService.removeFile', async () => {
    const fileId = 'tts-file-id';

    // Mock the fileService.removeFile to resolve
    vi.spyOn(fileService, 'removeFile').mockResolvedValue(undefined);

    await act(async () => {
      await useStore.getState().removeTTSFile(fileId);
    });

    expect(fileService.removeFile).toHaveBeenCalledWith(fileId);
  });

  // Test for uploadTTSFile
  it('uploadTTSFile should upload the file and return the file id', async () => {
    const testFile = new File(['content'], 'test.mp3', { type: 'audio/mp3' });
    const uploadedFileData = {
      id: 'new-tts-file-id',
      createdAt: testFile.lastModified,
      data: await testFile.arrayBuffer(),
      fileType: testFile.type,
      name: testFile.name,
      saveMode: 'local',
      size: testFile.size,
    };

    // Mock the fileService.uploadFile to resolve with uploadedFileData
    vi.spyOn(fileService, 'createFile').mockResolvedValue(uploadedFileData);

    let fileId;
    await act(async () => {
      fileId = await useStore.getState().uploadTTSFile(testFile);
    });

    expect(fileService.createFile).toHaveBeenCalledWith({
      createdAt: testFile.lastModified,
      data: await testFile.arrayBuffer(),
      fileType: testFile.type,
      name: testFile.name,
      saveMode: 'local',
      size: testFile.size,
    });
    expect(fileId).toBe(uploadedFileData.id);
  });

  // Test for uploadTTSByArrayBuffers
  it('uploadTTSByArrayBuffers should create a file and call uploadTTSFile', async () => {
    const messageId = 'message-id';
    const arrayBuffers = [new ArrayBuffer(10)];
    const fileType = 'audio/mp3';
    const fileName = `${messageId}.mp3`;

    // Spy on uploadTTSFile to simulate a successful upload
    const uploadTTSFileSpy = vi
      .spyOn(useStore.getState(), 'uploadTTSFile')
      .mockResolvedValue('new-tts-file-id');

    let fileId;
    await act(async () => {
      fileId = await useStore.getState().uploadTTSByArrayBuffers(messageId, arrayBuffers);
    });

    expect(uploadTTSFileSpy).toHaveBeenCalled();
    expect(fileId).toBe('new-tts-file-id');

    // Cleanup spy
    uploadTTSFileSpy.mockRestore();
  });

  // Test for useFetchTTSFile
  it('useFetchTTSFile should call useSWR and return file data', async () => {
    const fileId = 'tts-file-id';
    const fileData = {
      id: fileId,
      name: 'test',
      url: 'blob:test',
      fileType: 'audio/mp3',
      base64Url: '',
      saveMode: 'local',
    };

    // Mock the fileService.getFile to resolve with fileData
    vi.spyOn(fileService, 'getFile').mockResolvedValue(fileData as any);

    // Mock useSWR to call the fetcher function immediately
    const useSWRMock = vi.mocked(useSWR);
    useSWRMock.mockImplementation(((key: string, fetcher: any) => {
      const data = fetcher(key);
      return { data, error: undefined, isValidating: false, mutate: vi.fn() };
    }) as any);

    const { result } = renderHook(() => useStore.getState().useFetchTTSFile(fileId));

    await act(async () => {
      await result.current.data;
    });

    expect(fileService.getFile).toHaveBeenCalledWith(fileId);
  });
});
