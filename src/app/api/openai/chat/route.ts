import { OpenAIChatStreamPayload } from "@/types/openai/chat";

import { getPreferredRegion } from "../../config";
import { createBizOpenAI } from "../createBizOpenAI";
import { createChatCompletion } from "./createChatCompletion";

export const runtime = "edge";
export const preferredRegion = getPreferredRegion();
/**
 * 这个接口在java端实现,后面会删除
 * todo 确认没问题以后要删除
 * @deprecated
 * @author dongjak
 * @created 2024/01/04
 * @version 1.0
 * @since 1.0
 */
export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIChatStreamPayload;
  // await checkUserSubscriptions(req);
  const openaiOrErrResponse = createBizOpenAI(req, payload.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return createChatCompletion({ openai: openaiOrErrResponse, payload });
};
