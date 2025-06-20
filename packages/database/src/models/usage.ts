import { MessageMetadata } from "@/types/message";
import { NewSpendLog, SpendLogItem, spendLogs } from "../schemas/usage";
import { LobeChatDatabase } from "../type";
import { desc, eq } from "drizzle-orm";
import { UsageLog } from "@/types/usage";
import { formatDate } from "@/utils/format";

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
        let usages = new Map<string, { date: Date, logs: SpendLogItem[]}>()
        spends.forEach((spend) => {
            if (!usages.has(formatDate(spend.createdAt))){
                usages.set(formatDate(spend.createdAt), { date: spend.createdAt, logs: [spend] });
                return;
            }
            usages.get(formatDate(spend.createdAt))?.logs.push(spend);
        })
        // Calculate usage
        let usageLogs: UsageLog[] = [];
        usages.forEach((spends, date) => {
            const totalSpend = spends.logs.reduce((acc, spend) => acc + spend.spend, 0);
            const totalTokens = spends.logs.reduce((acc, spend) => (spend.totalTokens || 0) + acc, 0);
            const totalRequests = spends.logs.length;
            console.log('date', date, 'totalSpend', totalSpend, 'totalTokens', totalTokens, 'totalRequests', totalRequests);
            usageLogs.push({
                requestLogs: spends.logs,
                totalSpend,
                totalTokens,
                totalRequests,
                date: spends.date.getTime() / 1000, // Convert to seconds
            });
        })
        return usageLogs;
    }
}