import { URLS } from "@/services/_url";
import { GlobalServerConfig } from "@/types/settings";
import { preferenceApi } from "@/app/api/preference";

const VERSION_URL = "https://registry.npmmirror.com/@lobehub/chat";

class GlobalService {
  /**
   * get latest version from npm
   */
  getLatestVersion = async (): Promise<string> => {
    // const res = await fetch(VERSION_URL);
    // const data = await res.json();
    const res = await preferenceApi.getPreference({
      key: "app.version",
    });

    // return data['dist-tags']?.latest;
    return res.data!![0].value!!;
  };

  getGlobalConfig = async (): Promise<GlobalServerConfig> => {
    const res = await fetch(URLS.config);

    return res.json();
  };
}

export const globalService = new GlobalService();
