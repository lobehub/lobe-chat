import { DEBUG_MODEL } from '@/database/_deprecated/models/__DEBUG';

class DebugService {
  async insertLargeDataToDB() {
    await DEBUG_MODEL.createRandomData({
      messageCount: 100_000,
      sessionCount: 40,
      startIndex: 0,
      topicCount: 200,
    });

    console.log('已插入10w');

    await DEBUG_MODEL.createRandomData({
      messageCount: 300_000,
      sessionCount: 40,
      startIndex: 100_001,
      topicCount: 200,
    });
    console.log('已插入40w');

    await DEBUG_MODEL.createRandomData({
      messageCount: 300_000,
      sessionCount: 40,
      startIndex: 400_001,
      topicCount: 200,
    });
    console.log('已插入70w');

    await DEBUG_MODEL.createRandomData({
      messageCount: 300_000,
      sessionCount: 40,
      startIndex: 700_001,
      topicCount: 200,
    });
    console.log('已插入100w');
  }
}

export const debugService = new DebugService();
