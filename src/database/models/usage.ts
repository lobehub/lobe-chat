import { MessageMetadata } from "@/types/message";
import { NewSpendLog, SpendLogItem, spendLogs } from "../schemas/usage";
import { LobeChatDatabase } from "../type";
import { desc, eq } from "drizzle-orm";
import { UsageLog } from "@/types/usage";

export class UsageModel {
    private userId: string;
    private db: LobeChatDatabase;
    constructor(db: LobeChatDatabase, userId: string) {
        this.userId = userId;
        this.db = db;
    }

    createSpendLog = async (params: NewSpendLog) => {
        // Should find org_id, team_id from userId first ...
        const [result] = await this.db
            .insert(spendLogs)
            .values({ ...params, userId: this.userId })
            .onConflictDoNothing()
            .returning();
        return result;
    }

    getSpendLogs = async () => {
        return await this.db.query.spendLogs.findMany({
            where: eq(spendLogs.userId, this.userId),
            orderBy: desc(spendLogs.updatedAt),
        })
    }

    getUsages = async () => {
        const spends = await this.db.query.spendLogs.findMany({
            where: eq(spendLogs.userId, this.userId),
            orderBy: desc(spendLogs.updatedAt),
        })
        // Clustering by time
        let usages = new Map<number, SpendLogItem[]>()
        spends.forEach((spend) => {
            const date = Math.floor(spend.createdAt.getTime() / 1000);
            if (!usages.has(date)){
                usages.set(date, [spend]);
                return;
            }
            usages.get(date)?.push(spend);
        })
        // Calculate usage
        let usageLogs: UsageLog[] = [];
        usages.forEach((spends, date) => {
            const totalSpend = spends.reduce((acc, spend) => acc + spend.spend, 0);
            const totalTokens = spends.reduce((acc, spend) => (spend.totalTokens || 0) + acc, 0);
            const totalRequests = spends.length;
            console.log('date', date, 'totalSpend', totalSpend, 'totalTokens', totalTokens, 'totalRequests', totalRequests);
            usageLogs.push({
                requestLogs: spends,
                totalSpend,
                totalTokens,
                totalRequests,
                date,
            });
        })
        return usageLogs;
    }
}