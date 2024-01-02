import { User, userApi } from "@/app/api/user";
import { OPENAI_API_KEY_HEADER_KEY, OPENAI_END_POINT } from "@/const/fetch";

export const checkUserSubscriptions = async (req: Request) => {
  const resp = await userApi.getUserSubscriptions(
    req.headers.get("Authorization") as string,
  );

  if (resp.data && resp.data.subscriptions) {
    req.headers.set(
      OPENAI_API_KEY_HEADER_KEY,
      resp.data.subscriptions[0].apiSecret.secret,
    );
    req.headers.set(
      OPENAI_END_POINT,
      resp.data.subscriptions[0].apiSecret.endpoint,
    );
  }
};

const getApiSecret = (user: User) => {};
