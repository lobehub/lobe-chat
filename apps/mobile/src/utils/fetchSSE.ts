import { DEFAULT_MODEL } from '@/const/settings';
import EventSource from 'react-native-sse';

const START_ANIMATION_SPEED = 4;
const END_ANIMATION_SPEED = 15;

interface SmoothMessageParams {
  onTextUpdate: (delta: string, text: string) => void;
  startSpeed?: number;
}

const createSmoothMessage = (params: SmoothMessageParams) => {
  const { startSpeed = START_ANIMATION_SPEED } = params;

  let buffer = '';
  // why use queue: https://shareg.pt/GLBrjpK
  const outputQueue: string[] = [];
  let isAnimationActive = false;
  let animationFrameId: number | null = null;

  // when you need to stop the animation, call this function
  const stopAnimation = () => {
    isAnimationActive = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  // define startAnimation function to display the text in buffer smooth
  // when you need to start the animation, call this function
  const startAnimation = (speed = startSpeed) =>
    new Promise<void>((resolve) => {
      if (isAnimationActive) {
        resolve();
        return;
      }

      isAnimationActive = true;

      const updateText = () => {
        // 如果动画已经不再激活，则停止更新文本
        if (!isAnimationActive) {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
          resolve();
          return;
        }

        // 如果还有文本没有显示
        // 检查队列中是否有字符待显示
        if (outputQueue.length > 0) {
          // 从队列中获取前 n 个字符（如果存在）
          const charsToAdd = outputQueue.splice(0, speed).join('');
          buffer += charsToAdd;

          // 更新消息内容，这里可能需要结合实际情况调整
          params.onTextUpdate(charsToAdd, buffer);
        } else {
          // 当所有字符都显示完毕时，清除动画状态
          isAnimationActive = false;
          animationFrameId = null;
          resolve();
          return;
        }

        animationFrameId = requestAnimationFrame(updateText);
      };

      animationFrameId = requestAnimationFrame(updateText);
    });

  const pushToQueue = (text: string) => {
    outputQueue.push(...text.split(''));
  };

  return {
    getBuffer: () => buffer,
    isAnimationActive,
    isTokenRemain: () => outputQueue.length > 0,
    pushToQueue,
    startAnimation,
    stopAnimation,
  };
};

interface FetchSSEParams {
  apiKey: string;
  messages: {
    content: string;
    role: string;
  }[];
  onDone: () => void;
  onError: (error: any) => void;
  onMessage: (content: string) => void;
  proxy: string;
}

export const fetchSSE = ({
  proxy,
  apiKey,
  messages,
  onMessage,
  onDone,
  onError,
}: FetchSSEParams) => {
  const smoothMessageController = createSmoothMessage({
    onTextUpdate: (delta, text) => {
      onMessage(text);
    },
  });

  const es = new EventSource(`${proxy}/v1/chat/completions`, {
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({
        content,
        role,
      })),
      model: DEFAULT_MODEL,
      stream: true,
    }),
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  // 处理消息事件
  es.addEventListener('message', (event) => {
    try {
      const rawData = event.data;
      if (typeof rawData !== 'string') {
        return;
      }

      if (rawData.trim() === '[DONE]') {
        smoothMessageController.stopAnimation();
        if (smoothMessageController.isTokenRemain()) {
          smoothMessageController.startAnimation(END_ANIMATION_SPEED).then(() => {
            onDone();
          });
        } else {
          onDone();
        }
        es.close();
        return;
      }

      const data = JSON.parse(rawData);
      const chunkContent = data.choices?.[0]?.delta?.content || '';
      if (chunkContent) {
        smoothMessageController.pushToQueue(chunkContent);
        if (!smoothMessageController.isAnimationActive) {
          smoothMessageController.startAnimation();
        }
      }
    } catch (err) {
      console.error('解析消息失败:', err, '原始数据:', event.data);
      smoothMessageController.stopAnimation();
      onError(err);
      es.close();
    }
  });

  // 处理错误事件
  es.addEventListener('error', (error) => {
    console.error('SSE 错误:', error);
    smoothMessageController.stopAnimation();
    onError(error);
    if (es && typeof es.close === 'function') {
      es.close();
    }
  });

  return {
    close: () => {
      smoothMessageController.stopAnimation();
      es.close();
    },
  };
};
