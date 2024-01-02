import { OpenAIChatStreamPayload } from "@/types/openai/chat";

import { getPreferredRegion } from "../../config";
import { createBizOpenAI } from "../createBizOpenAI";
import { createChatCompletion } from "./createChatCompletion";
import { checkUserSubscriptions } from "@/app/api/openai/chat/check";

export const runtime = "edge";
export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIChatStreamPayload;
  await checkUserSubscriptions(req);
  const openaiOrErrResponse = createBizOpenAI(req, payload.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return createChatCompletion({ openai: openaiOrErrResponse, payload });
};
