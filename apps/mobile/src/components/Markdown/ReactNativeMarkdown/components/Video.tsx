import { VideoView, useVideoPlayer } from 'expo-video';
import { memo } from 'react';
import { Components } from 'react-markdown';
import { StyleSheet, View } from 'react-native';

import { useStyles } from '../style';

const Video: Components['video'] = memo(({ src }) => {
  const { styles } = useStyles();

  const player = useVideoPlayer(src || '', (player) => {
    player.loop = false;
    player.muted = false;
  });

  return (
    <View
      style={[
        styles.video,
        {
          aspectRatio: 16 / 9,
          width: '100%',
        },
      ]}
    >
      <VideoView
        allowsFullscreen
        allowsPictureInPicture
        allowsVideoFrameAnalysis
        contentFit="cover"
        nativeControls
        player={player}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
});

export default Video;
