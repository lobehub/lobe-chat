import { useActionSheet } from '@expo/react-native-action-sheet';
import { ActionIcon, useTheme } from '@lobehub/ui-rn';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { PaperclipIcon } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, type PressableProps } from 'react-native';

import { useCurrentAgent } from '@/hooks/useCurrentAgent';
import { useModelSupportFiles } from '@/hooks/useModelSupportFiles';
import { useModelSupportVision } from '@/hooks/useModelSupportVision';
import { mobileFileStorage, mobileUploadService } from '@/services/upload';
import { useFileStore } from '@/store/file/store';

const MAX_IMAGE_SIZE = 2048; // Maximum dimension for images

interface FileUploadProps {
  onPress?: PressableProps['onPress'];
}

const FileUpload = memo<FileUploadProps>(({ onPress }) => {
  const { t } = useTranslation('chat');
  const { showActionSheetWithOptions } = useActionSheet();
  const [isUploading, setIsUploading] = useState(false);
  const dispatchUploadFileList = useFileStore((s) => s.dispatchChatUploadFileList);
  const { currentModel, currentProvider } = useCurrentAgent();
  const theme = useTheme();
  const supportVision = useModelSupportVision(currentModel, currentProvider);
  const enabledFiles = useModelSupportFiles(currentModel, currentProvider);
  const canUpload = supportVision || enabledFiles;

  /**
   * Convert HEIC/HEIF to PNG and resize if needed
   */
  const processImage = useCallback(async (uri: string): Promise<string> => {
    try {
      // Convert HEIC/HEIF to PNG and resize
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              height: MAX_IMAGE_SIZE,
              width: MAX_IMAGE_SIZE,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.PNG,
        },
      );
      return result.uri;
    } catch (error) {
      console.error('Failed to process image:', error);
      return uri;
    }
  }, []);

  /**
   * Process and upload file asynchronously (after adding to list)
   */
  const processAndUploadAsync = useCallback(
    async (
      tempId: string,
      uri: string,
      fileName: string,
      mimeType: string | undefined,
      fileSize: number,
    ) => {
      try {
        let processedUri = uri;
        let finalMimeType = mimeType || 'image/jpeg';
        let finalFileName = fileName;

        // Process images (HEIC conversion, resizing)
        if (finalMimeType.startsWith('image')) {
          const isHEIC =
            finalMimeType.includes('heic') ||
            finalMimeType.includes('heif') ||
            fileName.toLowerCase().endsWith('.heic') ||
            fileName.toLowerCase().endsWith('.heif');

          if (isHEIC || fileSize > 5 * 1024 * 1024) {
            // Convert HEIC or compress large images
            processedUri = await processImage(uri);
            if (isHEIC) {
              finalMimeType = 'image/png';
              finalFileName = fileName.replace(/\.(heic|heif)$/i, '.png');
            }
          }
        }

        // Update to uploading status (10% progress)
        dispatchUploadFileList({
          id: tempId,
          type: 'updateFile',
          value: {
            status: 'uploading',
            uploadState: { progress: 10, restTime: 0, speed: 0 },
          },
        });

        // Upload file locally first
        const { data: uploadData } = await mobileUploadService.uploadFile(
          processedUri,
          finalFileName,
          finalMimeType,
        );

        // Local upload complete (30% progress)
        dispatchUploadFileList({
          id: tempId,
          type: 'updateFile',
          value: {
            status: 'uploading',
            uploadState: { progress: 30, restTime: 0, speed: 0 },
          },
        });

        // Create base64 for preview (for images)
        const isImage = finalMimeType.startsWith('image');
        const base64 = isImage ? await mobileFileStorage.readAsBase64(processedUri) : null;
        const base64Url = base64 ? `data:${finalMimeType};base64,${base64}` : undefined;

        // Update to processing status (50% - preparing for S3 upload)
        dispatchUploadFileList({
          id: tempId,
          type: 'updateFile',
          value: {
            status: 'uploading',
            uploadState: { progress: 50, restTime: 0, speed: 0 },
          },
        });

        // Create file record on server (CRITICAL: needed for sendMessage)
        const { fileService } = await import('@/services/file');
        const { trpcClient } = await import('@/services/_auth/trpc');
        const { nanoid } = await import('@/utils/uuid');

        // Generate S3 key
        const extension = finalFileName.split('.').pop() || finalMimeType.split('/')[1] || 'bin';
        const s3Key = `chat-files/${nanoid()}.${extension}`;

        // Get pre-signed URL and upload to S3
        const preSignedUrl = await trpcClient.upload.createS3PreSignedUrl.mutate({
          pathname: s3Key,
        });

        // Upload base64 to S3
        if (base64Url) {
          const matches = base64Url.match(/^data:(.+?);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Content = matches[2];
            const buffer = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));

            await fetch(preSignedUrl, {
              body: buffer,
              headers: {
                'Content-Type': mimeType,
              },
              method: 'PUT',
            });
          }
        }

        // S3 upload complete (70% progress)
        dispatchUploadFileList({
          id: tempId,
          type: 'updateFile',
          value: {
            status: 'processing',
            uploadState: { progress: 70, restTime: 0, speed: 0 },
          },
        });

        // Create database record with server-assigned ID
        const fileResult = await fileService.createFile({
          fileType: finalMimeType,
          hash: uploadData.hash,
          metadata: {
            filename: finalFileName,
            path: s3Key,
          },
          name: finalFileName,
          size: uploadData.size,
          url: s3Key, // S3 key (will be converted to full URL by server)
        });

        // Database record created (90% progress)
        dispatchUploadFileList({
          id: tempId,
          type: 'updateFile',
          value: {
            status: 'processing',
            uploadState: { progress: 90, restTime: 0, speed: 0 },
          },
        });

        // Update file item with server ID (CRITICAL for sendMessage!)
        dispatchUploadFileList({
          id: tempId,
          type: 'updateFile',
          value: {
            base64Url,
            fileType: finalMimeType,
            id: fileResult.id, // Server-assigned ID!
            name: finalFileName,
            previewUrl: base64Url || processedUri,
            size: uploadData.size,
            status: 'success',
            uploadState: { progress: 100, restTime: 0, speed: 0 }, // Complete!
            url: fileResult.url, // Server URL
          } as any,
        });
      } catch (error) {
        console.error('Upload error:', error);
        // Update to error status
        dispatchUploadFileList({
          id: tempId,
          type: 'updateFile',
          value: { status: 'error' },
        });
      }
    },
    [processImage, dispatchUploadFileList],
  );

  /**
   * Handle camera photo capture
   */
  const handleCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('upload.permissions.title'), t('upload.permissions.camera'));
        return;
      }

      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileName = asset.fileName || `photo_${Date.now()}.png`;
      const tempId = `temp_${Date.now()}`;

      // 1. Add file to list immediately (using local URI for preview)
      dispatchUploadFileList({
        files: [
          {
            file: null as any,
            fileType: asset.mimeType || 'image/png',
            id: tempId,
            name: fileName,
            previewUrl: asset.uri, // Use local URI for immediate preview
            size: asset.fileSize || 0,
            status: 'pending' as const,
            url: '',
          },
        ] as any,
        type: 'addFiles',
      });

      // 2. Process and upload asynchronously (don't block UI)
      processAndUploadAsync(tempId, asset.uri, fileName, asset.mimeType, asset.fileSize || 0);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(t('upload.errors.title'), t('upload.errors.camera'));
    } finally {
      setIsUploading(false);
    }
  }, [t, dispatchUploadFileList, processAndUploadAsync]);

  /**
   * Handle gallery image/video selection
   */
  const handleGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('upload.permissions.title'), t('upload.permissions.gallery'));
        return;
      }

      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: true,
        mediaTypes: ['images', 'videos'],
        quality: 0.8,
        selectionLimit: 9,
      });

      if (result.canceled) return;

      // 1. Create file items and add to list immediately
      const fileItems = result.assets.map((asset: any) => {
        const fileName =
          asset.fileName || `file_${Date.now()}.${(asset.mimeType || 'image/jpeg').split('/')[1]}`;
        const tempId = `temp_${Date.now()}_${Math.random()}`;

        return {
          // Keep asset info for processing
          _asset: {
            fileName,
            fileSize: asset.fileSize || 0,
            mimeType: asset.mimeType,
            uri: asset.uri,
          },

          file: null as any,

          fileType: asset.mimeType || 'image/jpeg',

          id: tempId,

          name: fileName,

          previewUrl: asset.uri,

          // Use local URI for immediate preview
          size: asset.fileSize || 0,

          status: 'pending' as const,

          url: '',
        };
      });

      // Add to list immediately
      dispatchUploadFileList({
        files: fileItems as any,
        type: 'addFiles',
      });

      // 2. Process and upload each file asynchronously
      fileItems.forEach((item: any) => {
        processAndUploadAsync(
          item.id,
          item._asset.uri,
          item._asset.fileName,
          item._asset.mimeType,
          item._asset.fileSize,
        );
      });
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(t('upload.errors.title'), t('upload.errors.gallery'));
    } finally {
      setIsUploading(false);
    }
  }, [t, dispatchUploadFileList, processAndUploadAsync]);

  /**
   * Handle document picker
   */
  const handleDocuments = useCallback(async () => {
    try {
      setIsUploading(true);

      // Limit file types based on model capabilities (aligned with web)
      // - If enabledFiles: allow all file types
      // - If only supportVision: limit to images and videos
      const fileTypes = enabledFiles ? '*/*' : ['image/*', 'video/*'];

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: fileTypes,
      });

      if (result.canceled) return;

      // 1. Create file items and add to list immediately
      const fileItems = result.assets.map((asset: any) => {
        const tempId = `temp_${Date.now()}_${Math.random()}`;

        return {
          // Keep asset info for processing
          _asset: { mimeType: asset.mimeType, name: asset.name, size: asset.size, uri: asset.uri },

          file: null as any,

          fileType: asset.mimeType || 'application/octet-stream',

          id: tempId,

          name: asset.name,

          previewUrl: asset.uri,

          // Use local URI for immediate preview
          size: asset.size,

          status: 'pending' as const,

          url: '',
        };
      });

      // Add to list immediately
      dispatchUploadFileList({
        files: fileItems as any,
        type: 'addFiles',
      });

      // 2. Upload each file asynchronously
      fileItems.forEach((item: any) => {
        processAndUploadAsync(
          item.id,
          item._asset.uri,
          item._asset.name,
          item._asset.mimeType,
          item._asset.size,
        );
      });
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert(t('upload.errors.title'), t('upload.errors.file'));
    } finally {
      setIsUploading(false);
    }
  }, [enabledFiles, t, dispatchUploadFileList, processAndUploadAsync]);

  /**
   * Show action sheet with upload options
   */
  const handlePickFile = useCallback(() => {
    const options = [];
    const handlers: (() => void)[] = [];

    if (!canUpload) return;

    // Camera option
    options.push(t('upload.actions.camera'));
    handlers.push(handleCamera);

    // Gallery option (images/videos from photo library)
    options.push(t('upload.actions.chooseFromGallery'));
    handlers.push(handleGallery);

    // File picker option
    options.push(
      enabledFiles ? t('upload.actions.chooseFile') : t('upload.actions.chooseFromFile'),
    );
    handlers.push(handleDocuments);

    options.push(t('upload.actions.cancel'));

    showActionSheetWithOptions(
      {
        cancelButtonIndex: options.length - 1,
        options,
        title: t('upload.actions.title'),
      },
      (selectedIndex) => {
        if (selectedIndex !== undefined && selectedIndex < handlers.length) {
          handlers[selectedIndex]();
        }
      },
    );
  }, [
    canUpload,
    enabledFiles,
    handleCamera,
    handleDocuments,
    handleGallery,
    showActionSheetWithOptions,
    t,
  ]);

  if (!canUpload) return null;

  return (
    <ActionIcon
      color={theme.colorTextDescription}
      disabled={isUploading}
      icon={PaperclipIcon}
      onPress={(e) => {
        onPress?.(e);
        handlePickFile();
      }}
      size={{
        blockSize: 32,
        borderRadius: 16,
        size: 22,
      }}
    />
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
