import { DEBUG_MODEL } from '@/database/models/__DEBUG';

class DebugService {
  async insertLargeDataToDB() {
    return DEBUG_MODEL.createRandomData({
      messageCount: 400_000,
      sessionCount: 40,
      topicCount: 200,
    });
  }
}

export const debugService = new DebugService();
