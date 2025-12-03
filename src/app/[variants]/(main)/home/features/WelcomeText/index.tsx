import { TypewriterEffect } from '@lobehub/ui/awesome';
import { useTheme } from 'antd-style';
import { shuffle } from 'lodash-es';
import { memo, useMemo } from 'react';
import { Center } from 'react-layout-kit';

const WelcomeText = memo(() => {
  const theme = useTheme();
  const sentences = useMemo(
    () =>
      shuffle([
        '欢迎回来',
        '嗨，我在呢',
        '我已就绪！',
        '很高兴见到你',
        '准备开始了吗？',
        '今日事，我来帮',
        '继续前行吧！',
        '一起加油吧',
        '开工咯',
        '生产力拉满～',
        '听候差遣！',
        '久等啦～',
        '开始行动吧',
        '听候差遣！',
        '带着新问题来了吧？',
        '今天也辛苦啦！',
        '灵感加载中',
        '上线即满电 ⚡',
        '出发！',
        '我的思绪已跟上节奏。',
        '灵感即将出现',
        '只等你的召唤',
      ]),
    [],
  );

  return (
    <Center
      style={{
        fontSize: 28,
        fontWeight: 'bold',
      }}
    >
      <TypewriterEffect
        cursorColor={theme.colorTextDescription}
        deletingSpeed={32}
        pauseDuration={12_000}
        sentences={sentences}
        typingSpeed={96}
      />
    </Center>
  );
});

export default WelcomeText;
