import { VideoView, useVideoPlayer } from 'expo-video';
import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import { useStyles } from './style';
import { VideoProps } from './type';

const Video = memo<VideoProps>(
  ({
    src,
    aspectRatio: initialAspectRatio = 16 / 9,
    width,
    height,
    loop = false,
    muted = false,
    style,
    onPress,
    onLongPress,
    ...rest
  }) => {
    const { styles } = useStyles();
    const [calculatedAspectRatio, setCalculatedAspectRatio] = useState<number>(initialAspectRatio);

    const player = useVideoPlayer(src || '', (player) => {
      player.loop = loop;
      player.muted = muted;
    });

    // 监听视频加载，获取实际的宽高比
    useEffect(() => {
      const handleSourceLoad = () => {
        const videoTracks = player.availableVideoTracks;
        if (videoTracks && videoTracks.length > 0) {
          const { width, height } = videoTracks[0].size;
          if (width > 0 && height > 0) {
            const actualAspectRatio = width / height;
            setCalculatedAspectRatio(actualAspectRatio);
          }
        }
      };

      const subscription = player.addListener('sourceLoad', handleSourceLoad);

      return () => {
        subscription.remove();
      };
    }, [player]);

    const videoStyle = useMemo(() => {
      return [
        styles.video,
        style,
        { aspectRatio: calculatedAspectRatio },
        // width 和 height props 优先级最高
        width !== undefined && { width },
        height !== undefined && { height },
      ];
    }, [styles.video, style, calculatedAspectRatio, width, height]);

    return (
      <Pressable onLongPress={onLongPress} onPress={onPress} style={styles.container}>
        <VideoView
          allowsFullscreen
          allowsPictureInPicture
          allowsVideoFrameAnalysis
          contentFit="cover"
          nativeControls
          player={player}
          style={videoStyle}
          {...rest}
        />
      </Pressable>
    );
  },
);

export default Video;
