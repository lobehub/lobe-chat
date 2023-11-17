import { ActionIcon, ActionIconProps, Icon, Tag } from '@lobehub/ui';
import { Dropdown, Slider } from 'antd';
import { Download, PauseCircle, Play, StopCircle } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

const secondsToMinutesAndSeconds = (num: number) => Math.floor(num);
export interface AudioProps {
  currentTime: number;
  download: () => void;
  duration: number;
  isPlaying: boolean;
  pause: () => void;
  play: () => void;
  setTime: (time: number) => void;
  stop: () => void;
}

export interface AudioPlayerProps {
  allowPause?: boolean;
  audio: AudioProps;
  buttonSize?: ActionIconProps['size'];
  className?: string;
  isLoading?: boolean;
  onInitPlay?: () => void;
  onPause?: () => void;
  onPlay?: () => void;
  onStop?: () => void;
  showSlider?: boolean;
  style?: React.CSSProperties;
  timeRender?: 'tag' | 'text';
  timeStyle?: React.CSSProperties;
  timeType?: 'left' | 'current' | 'combine';
}

const AudioPlayer = memo<AudioPlayerProps>(
  ({
    isLoading,
    style,
    timeStyle,
    buttonSize,
    className,
    audio,
    allowPause = true,
    timeType = 'left',
    showSlider = true,
    timeRender = 'text',
    onInitPlay,
    onPause,
    onStop,
    onPlay,
  }) => {
    const { isPlaying, play, stop, pause, duration, setTime, currentTime, download } = audio;

    const formatedLeftTime = secondsToMinutesAndSeconds(duration - currentTime);
    const formatedCurrentTime = secondsToMinutesAndSeconds(currentTime);
    const formatedDuration = secondsToMinutesAndSeconds(duration);

    const Time = useMemo(
      () => (timeRender === 'tag' ? Tag : (props: any) => <div {...props} />),
      [timeRender],
    );

    const handlePlay = useCallback(() => {
      if ((!duration || duration === 0) && !isLoading) {
        onInitPlay?.();
      } else {
        play?.();
        onPlay?.();
      }
    }, [play, duration]);

    const handlePause = useCallback(() => {
      pause?.();
      onPause?.();
    }, [pause]);

    const handleStop = useCallback(() => {
      stop?.();
      onStop?.();
    }, [stop]);

    return (
      <Flexbox
        align={'center'}
        className={className}
        gap={8}
        horizontal
        style={{ paddingRight: 8, width: '100%', ...style }}
      >
        <ActionIcon
          icon={isPlaying ? (allowPause ? PauseCircle : StopCircle) : Play}
          loading={isLoading}
          onClick={isPlaying ? (allowPause ? handlePause : handleStop) : handlePlay}
          size={buttonSize || { blockSize: 32, fontSize: 16 }}
          style={{ flex: 'none' }}
        />
        {showSlider && (
          <Slider
            disabled={duration === 0}
            max={duration}
            min={0}
            onChange={(e) => setTime(e)}
            step={0.01}
            style={{ flex: 1 }}
            tooltip={{ formatter: secondsToMinutesAndSeconds as any }}
            value={currentTime}
          />
        )}
        <Dropdown
          disabled={duration === 0}
          menu={{
            items: [
              {
                key: 'download',
                label: <Icon icon={Download} size={{ fontSize: 16 }} />,
                onClick: download,
              },
            ],
          }}
          placement="top"
        >
          <Time style={{ cursor: 'pointer', flex: 'none', ...timeStyle }}>
            {timeType === 'left' && formatedLeftTime}
            {timeType === 'current' && formatedCurrentTime}
            {timeType === 'combine' && (
              <span>
                {formatedCurrentTime}
                <span style={{ opacity: 0.66 }}>{` / ${formatedDuration}`}</span>
              </span>
            )}
          </Time>
        </Dropdown>
      </Flexbox>
    );
  },
);

export default AudioPlayer;
