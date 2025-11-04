import { VideoView, useVideoPlayer } from 'expo-video';
import { memo, useMemo } from 'react';
import { Pressable } from 'react-native';

import { useStyles } from './style';
import { VideoProps } from './type';

const Video = memo<VideoProps>(
  ({
    src,
    aspectRatio = 16 / 9,
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

    const player = useVideoPlayer(src || '', (player) => {
      player.loop = loop;
      player.muted = muted;
    });

    const videoStyle = useMemo(() => {
      return [
        styles.video,
        style,
        { aspectRatio },
        // width 和 height props 优先级最高
        width !== undefined && { width },
        height !== undefined && { height },
      ];
    }, [styles.video, style, aspectRatio, width, height]);

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
