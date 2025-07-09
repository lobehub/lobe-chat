import { NewSpendLog, SpendLogItem, spendLogs } from "../schemas/usage";
import { LobeChatDatabase } from "../type";
import { eq, gt, lt, and, asc, desc } from "drizzle-orm";
import { UsageLog } from "@/types/usage";
import { formatDate } from "@/utils/format";
import dayjs from "dayjs";
import { genRangeWhere, genWhere } from "../utils/genWhere";

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
            orderBy: asc(spendLogs.updatedAt),
        })
    }

    getUsages = async (mo?: string) => {
        // 设置 startAt 和 endAt
        let startAt: string;
        let endAt: string;
        if (mo) {
            // mo 格式: "YYYY-MM"
            startAt = dayjs(mo, "YYYY-MM").startOf("month").format("YYYY-MM-DD");
            endAt = dayjs(mo, "YYYY-MM").endOf("month").format("YYYY-MM-DD");
        } else {
            startAt = dayjs().startOf("month").format("YYYY-MM-DD");
            endAt = dayjs().endOf("month").format("YYYY-MM-DD");
        }
        console.log('getUsages', 'mo', mo, 'startAt', startAt, 'endAt', endAt);
        const spends = await this.db.query.spendLogs.findMany({
            where: and(
                genWhere([
                    eq(spendLogs.userId, this.userId),
                    genRangeWhere([startAt, endAt], spendLogs.createdAt, (date) => date.toDate()),
                ])
            ),
            orderBy: desc(spendLogs.updatedAt),
        })
        // Clustering by time
        let usages = new Map<string, { date: Date, logs: SpendLogItem[] }>()
        spends.forEach((spend) => {
            if (!usages.has(formatDate(spend.createdAt))) {
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
                date: spends.date.getTime(),
                day: date, // Store the formatted date as a string
            });
        })
        // Padding to ensure the date range is complete
        const startDate = dayjs(startAt);
        const endDate = dayjs(endAt);
        const paddedUsageLogs: UsageLog[] = [];
        // For every day in the range, check if it exists in usageLogs
        // If exists, use it; if not, create a new log with 0 values
        for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
            const log = usageLogs.find(log => log.day === date.format('YYYY-MM-DD'));
            if (log) {
                paddedUsageLogs.push(log);
            } else {
                paddedUsageLogs.push({
                    requestLogs: [],
                    totalSpend: 0,
                    totalTokens: 0,
                    totalRequests: 0,
                    date: date.toDate().getTime(),
                    day: date.format('YYYY-MM-DD'),
                });
            }
        }
        return paddedUsageLogs;
    }
}