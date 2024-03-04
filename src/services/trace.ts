import { API_ENDPOINTS } from '@/services/_url';
import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/slices/preference/selectors';
import { TraceEventBasePayload, TraceEventPayloads } from '@/types/trace';

class TraceService {
  private async request<T>(data: T) {
    try {
      return fetch(API_ENDPOINTS.trace, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    } catch (e) {
      console.error(e);
    }
  }

  async traceEvent(data: TraceEventPayloads & TraceEventBasePayload) {
    const enabled = preferenceSelectors.userAllowTrace(useGlobalStore.getState());

    if (!enabled) return;

    return this.request(data);
  }
}

export const traceService = new TraceService();
