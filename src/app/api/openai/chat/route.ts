import { OpenAIChatStreamPayload } from "@/types/openai/chat";

import { getPreferredRegion } from "../../config";
import { createBizOpenAI } from "../createBizOpenAI";
import { createChatCompletion } from "./createChatCompletion";
// import {userApi} from "@/app/api/user";

export const runtime = "edge";
export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIChatStreamPayload;
  // console.log(await userApi.getUserSubscriptions())
  fetch("http://192.168.1.6:8084/api/user/subscriptions", {
    method: "GET", // GET is the default method for fetch, but it's good to be explicit
    headers: {
      Accept: "*/*",
      "Accept-Language": "zh-CN,zh;q=0.9,ru;q=0.8",
      Authorization: req.headers.get("Authorization") as string,
      "Content-Type": "application/x-www-form-urlencoded",
      DNT: "1",
      Referer: "http://192.168.1.6:8084/doc.html",
      "Request-Origion": "Knife4j", // Note that "Request-Origion" might be a typo for "Request-Origin"
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    credentials: "include", // To include cookies for cross-origin requests
    mode: "cors", // Assuming you're making a CORS request
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // or response.text() if the response is not JSON
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error,
      );
    });
  const openaiOrErrResponse = createBizOpenAI(req, payload.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return createChatCompletion({ openai: openaiOrErrResponse, payload });
};
