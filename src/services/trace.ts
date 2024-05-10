import { API_ENDPOINTS } from '@/services/_url';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { TraceEventBasePayload, TraceEventPayloads } from '@/types/trace';

class TraceService {
  private async request<T>(data: T) {
    try {
      return fetch(API_ENDPOINTS.trace, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
    } catch (e) {
      console.error(e);
    }
  }

  async traceEvent(data: TraceEventPayloads & TraceEventBasePayload) {
    const enabled = preferenceSelectors.userAllowTrace(useUserStore.getState());

    if (!enabled) return;

    return this.request(data);
  }
}

export const traceService = new TraceService();
