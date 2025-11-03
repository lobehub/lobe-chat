import { Image } from 'expo-image';
import { memo, useMemo, useState } from 'react';

import Center from '../Center';
import Text from '../Text';
import { useStyles } from './style';
import type { MaterialFileTypeIconProps } from './type';
import { genCdnUrl, getIconUrlForDirectoryPath, getIconUrlForFilePath } from './utils';

const MaterialFileTypeIcon = memo<MaterialFileTypeIconProps>(
  ({ fallbackUnknownType = true, filename, size = 48, type = 'file', style, open, ...rest }) => {
    const { styles } = useStyles();
    const [imageError, setImageError] = useState(false);

    const ICONS_URL = genCdnUrl({
      path: 'assets',
      pkg: '@lobehub/assets-fileicon',
      version: '1.0.0',
    });

    const iconUrl: string = useMemo(() => {
      return type === 'file'
        ? getIconUrlForFilePath({ fallbackUnknownType, iconsUrl: ICONS_URL, path: filename })
        : getIconUrlForDirectoryPath({
            fallbackUnknownType,
            iconsUrl: ICONS_URL,
            open,
            path: filename,
          });
    }, [ICONS_URL, type, filename, open, fallbackUnknownType]);

    // 如果没有图标 URL 或者图片加载失败，显示回退内容
    if (!iconUrl || imageError) {
      const extension = filename.split('.').pop() || '?';

      return (
        <Center height={size} style={[styles.container, style]} width={size} {...rest}>
          {type === 'file' && (
            <Text fontSize={10} style={styles.fallbackText} type="secondary">
              {extension.toUpperCase()}
            </Text>
          )}
        </Center>
      );
    }

    return (
      <Center height={size} style={[styles.container, style]} width={size} {...rest}>
        <Image
          accessibilityLabel={filename}
          cachePolicy="memory-disk"
          contentFit="contain"
          onError={() => setImageError(true)}
          source={{ uri: iconUrl }}
          style={{ height: size, width: size }}
          transition={150}
        />
      </Center>
    );
  },
);

MaterialFileTypeIcon.displayName = 'MaterialFileTypeIcon';

export default MaterialFileTypeIcon;
