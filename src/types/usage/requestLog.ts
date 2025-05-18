import { z } from "zod";
import { ChatModelPricing } from "../aiModel";
import { MessageMetadata } from "../message";

export interface RequestLog {
    /**
     * 模型信息
     */
    model: string;
    provider: string;
    /**
     * 用量信息
     */
    metadata?: MessageMetadata;
    /**
     * 请求标识
     */
    callType: "chat" | "image";
    /**
     * 费用
     */
    pricing?: ChatModelPricing;
}

export const RequestLogSchema = z.object({
    model: z.string(),
    provider: z.string(),
    metadata: z.any().optional(),
    callType: z.enum(["chat", "history_summary"]),
    spend: z.number(),
})