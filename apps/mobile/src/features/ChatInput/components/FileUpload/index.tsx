import { useActionSheet } from '@expo/react-native-action-sheet';
import { ActionIcon, Toast, useTheme } from '@lobehub/ui-rn';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { PaperclipIcon } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, type PressableProps, Image as RNImage } from 'react-native';
import { Image, Video } from 'react-native-compressor';

import { useCurrentAgent } from '@/hooks/useCurrentAgent';
import { useModelSupportFiles } from '@/hooks/useModelSupportFiles';
import { useModelSupportVision } from '@/hooks/useModelSupportVision';
import { mobileFileStorage, mobileUploadService } from '@/services/upload';
import { useFileStore } from '@/store/file/store';

const MAX_IMAGE_SIZE = 1024; // Maximum dimension for images (single side)
const MAX_VIDEO_SIZE = 854; // 480p video max dimension (854×480 for 16:9)
const MAX_VIDEO_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for video files (aligned with web)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

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
   * Process image: resize and compress using react-native-compressor
   * @param uri - Image URI
   * @param mimeType - Original mime type (to determine output format)
   * @returns Processed image URI and final format
   */
  const processImage = useCallback(
    async (uri: string, mimeType?: string): Promise<{ mimeType: string; uri: string }> => {
      try {
        // Determine output format based on input type
        let outputFormat: 'jpg' | 'png' = 'jpg'; // Default to JPEG (best for photos)
        let outputMimeType = 'image/jpeg';

        if (mimeType?.includes('png')) {
          outputFormat = 'png';
          outputMimeType = 'image/png';
        }
        // HEIC/HEIF -> JPEG (better compression for photos)
        // JPEG -> JPEG (keep original format)

        const compressedUri = await Image.compress(uri, {
          compressionMethod: 'auto',
          input: 'uri',
          maxHeight: MAX_IMAGE_SIZE,
          maxWidth: MAX_IMAGE_SIZE,
          output: outputFormat,
          quality: 0.8,
        });

        return {
          mimeType: outputMimeType,
          uri: compressedUri,
        };
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Return original URI if compression fails
        return {
          mimeType: mimeType || 'image/jpeg',
          uri,
        };
      }
    },
    [],
  );

  /**
   * Process video: compress to 480p MP4
   * @param uri - Video URI
   * @returns Compressed video URI
   */
  const processVideo = useCallback(
    async (uri: string, tempId: string): Promise<{ mimeType: string; uri: string }> => {
      try {
        const compressedUri = await Video.compress(
          uri,
          {
            compressionMethod: 'auto',
            maxSize: MAX_VIDEO_SIZE, // 854px max dimension for 480p
            minimumFileSizeForCompress: 5, // Only compress if > 5MB
          },
          (progress) => {
            // Update compression progress (0-100)
            const compressionProgress = Math.round(progress * 100);

            // Update UI with compression progress
            dispatchUploadFileList({
              id: tempId,
              type: 'updateFile',
              value: {
                status: 'uploading',
                uploadState: { progress: compressionProgress * 0.5 }, // 0-50% for compression
              } as any,
            });
          },
        );

        return {
          mimeType: 'video/mp4',
          uri: compressedUri,
        };
      } catch (error) {
        console.error('Failed to compress video:', error);
        // Return original URI if compression fails
        return {
          mimeType: 'video/mp4',
          uri,
        };
      }
    },
    [dispatchUploadFileList],
  );

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

        // Process images (HEIC conversion, resizing, compression)
        if (finalMimeType.startsWith('image')) {
          const isHEIC =
            finalMimeType.includes('heic') ||
            finalMimeType.includes('heif') ||
            fileName.toLowerCase().endsWith('.heic') ||
            fileName.toLowerCase().endsWith('.heif');

          // Check if image needs compression based on:
          // 1. Format: HEIC/HEIF always needs conversion
          // 2. File size: > 5MB
          // 3. Dimensions: width or height > 1024px
          let needsCompression = isHEIC || fileSize > 5 * 1024 * 1024;

          if (!needsCompression) {
            // Check image dimensions
            try {
              const { width, height } = await new Promise<{ height: number; width: number }>(
                (resolve, reject) => {
                  RNImage.getSize(
                    processedUri,
                    (width: number, height: number) => resolve({ height, width }),
                    reject,
                  );
                },
              );
              needsCompression = width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE;
            } catch {
              // If we can't get dimensions, compress anyway to be safe
              needsCompression = true;
            }
          }

          if (needsCompression) {
            // Convert HEIC or compress large images
            const processed = await processImage(uri, finalMimeType);
            processedUri = processed.uri;
            finalMimeType = processed.mimeType;

            // Update file extension if format changed
            if (isHEIC) {
              const newExt = processed.mimeType.split('/')[1];
              finalFileName = fileName.replace(/\.(heic|heif)$/i, `.${newExt}`);
            }
          }
        }

        // Process videos (compress to 480p MP4)
        if (finalMimeType.startsWith('video')) {
          const processed = await processVideo(uri, tempId);
          processedUri = processed.uri;
          finalMimeType = processed.mimeType;

          // Update file extension to .mp4
          if (!fileName.toLowerCase().endsWith('.mp4')) {
            finalFileName = fileName.replace(/\.\w+$/, '.mp4');
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

        // Read file as base64 for upload (all file types: images, videos, documents, etc.)
        const base64 = await mobileFileStorage.readAsBase64(processedUri);
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

        // Upload file to S3 (IMPORTANT: both images and videos need this!)
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
        } else {
          console.error('Failed to read file as base64, cannot upload to S3');
          throw new Error('Failed to read file for upload');
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
            // Use CDN URL for preview (works for all file types)
            // For images: base64 works fine, but CDN is better for consistency
            // For videos: must use CDN URL (base64 is too large)
            previewUrl: fileResult.url,
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

      // Check file size (before compression)
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        Toast.error(t('upload.errors.fileSizeExceeded', { size: 100 }));
        return;
      }

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

      // 1. Filter files by size and create file items
      const validAssets = result.assets.filter((asset: any) => {
        // Check video file size limit (20MB, aligned with web)
        if (
          asset.mimeType?.startsWith('video') &&
          asset.fileSize &&
          asset.fileSize > MAX_VIDEO_FILE_SIZE
        ) {
          Toast.error(
            t('upload.validation.videoSizeExceeded', {
              actualSize: `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB`,
            }),
          );
          return false;
        }
        // Check general file size limit (100MB)
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          Toast.error(
            t('upload.errors.fileSizeExceeded', { size: 100 }) + `: ${asset.fileName || 'file'}`,
          );
          return false;
        }
        return true;
      });

      if (validAssets.length === 0) return;

      const fileItems = validAssets.map((asset: any) => {
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

      // 1. Filter files by size and create file items
      const validAssets = result.assets.filter((asset: any) => {
        // Check video file size limit (20MB, aligned with web)
        if (asset.mimeType?.startsWith('video') && asset.size && asset.size > MAX_VIDEO_FILE_SIZE) {
          Toast.error(
            t('upload.validation.videoSizeExceeded', {
              actualSize: `${(asset.size / (1024 * 1024)).toFixed(1)} MB`,
            }),
          );
          return false;
        }
        // Check general file size limit (100MB)
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          Toast.error(
            t('upload.errors.fileSizeExceeded', { size: 100 }) + `: ${asset.name || 'file'}`,
          );
          return false;
        }
        return true;
      });

      if (validAssets.length === 0) return;

      const fileItems = validAssets.map((asset: any) => {
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
