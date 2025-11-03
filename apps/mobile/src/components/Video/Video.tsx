import { VideoView, useVideoPlayer } from 'expo-video';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

import Block from '../Block';
import { useStyles } from './style';
import { VideoProps } from './type';

const Video = memo<VideoProps>(
  ({
    src,
    borderRadius,
    variant = 'filled',
    aspectRatio = 16 / 9,
    width,
    height,
    loop = false,
    muted = false,
    style,
    ...rest
  }) => {
    const { styles } = useStyles();

    const player = useVideoPlayer(src || '', (player) => {
      player.loop = loop;
      player.muted = muted;
    });

    return (
      <Block
        borderRadius={borderRadius}
        height={height}
        style={[
          styles.video,
          {
            aspectRatio,
          },
          style,
        ]}
        variant={variant}
        width={width || '100%'}
      >
        <VideoView
          allowsFullscreen
          allowsPictureInPicture
          allowsVideoFrameAnalysis
          contentFit="cover"
          nativeControls
          player={player}
          style={[StyleSheet.absoluteFillObject]}
          {...rest}
        />
      </Block>
    );
  },
);

export default Video;
