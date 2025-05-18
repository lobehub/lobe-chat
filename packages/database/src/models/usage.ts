import { MessageMetadata } from "@/types/message";
import { spendLogs } from "../schemas/usage";
import { LobeChatDatabase } from "../type";

export interface CreateSpendLogParams {
    model: string;
    provider: string;
    spend: number;
    callType: 'chat' | 'history_summary';
    ipAddress: string;
    ttft?: number;
    tps?: number;
    inputStartAt?: Date;
    outputStartAt?: Date;
    outputFinishAt?: Date;
    totalInputTokens?: number;
    totalOutputTokens?: number;
    totalTokens?: number;
    metadata?: MessageMetadata;
}

export class UsageModel {
    private userId: string;
    private db: LobeChatDatabase;
    constructor(db: LobeChatDatabase, userId: string) {
        this.userId = userId;
        this.db = db;
    }

    createSpendLog = async (params: CreateSpendLogParams) => {
        // Should find org_id, team_id from userId first ...
        const [result] = await this.db
            .insert(spendLogs)
            .values({ ...params, userId: this.userId })
            .onConflictDoNothing()
            .returning();
        return result;
    }
}