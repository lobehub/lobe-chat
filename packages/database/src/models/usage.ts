import { UsageLog } from '@lobechat/types/src/usage';
import dayjs from 'dayjs';
import { and, asc, desc, eq } from 'drizzle-orm';

import { formatDate } from '@/utils/format';

import { UsageRecordItem, usageRecords, NewUsageRecord } from '../schemas/usage';
import { LobeChatDatabase } from '../type';
import { genRangeWhere, genWhere } from '../utils/genWhere';

export class UsageRecordModel {
  private userId: string;
  private db: LobeChatDatabase;
  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: NewUsageRecord) => {
    // Should find org_id, team_id from userId first ...
    const [result] = await this.db
      .insert(usageRecords)
      .values({ ...params, userId: this.userId })
      .onConflictDoNothing()
      .returning();
    return result;
  };

  findByMonth = async (mo?: string) => {
    // 设置 startAt 和 endAt
    let startAt: string;
    let endAt: string;
    if (mo) {
      // mo 格式: "YYYY-MM"
      startAt = dayjs(mo, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
      endAt = dayjs(mo, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
    } else {
      startAt = dayjs().startOf('month').format('YYYY-MM-DD');
      endAt = dayjs().endOf('month').format('YYYY-MM-DD');
    }
    return await this.db.query.usageRecords.findMany({
      orderBy: asc(usageRecords.updatedAt),
      where: and(
        genWhere([
          eq(usageRecords.userId, this.userId),
          genRangeWhere([startAt, endAt], usageRecords.createdAt, (date) => date.toDate())
        ])
      ),
    });
  };

  findAndGroupByDay = async (mo?: string) => {
    // 设置 startAt 和 endAt
    let startAt: string;
    let endAt: string;
    if (mo) {
      // mo 格式: "YYYY-MM"
      startAt = dayjs(mo, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
      endAt = dayjs(mo, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
    } else {
      startAt = dayjs().startOf('month').format('YYYY-MM-DD');
      endAt = dayjs().endOf('month').format('YYYY-MM-DD');
    }
    const spends = await this.db.query.usageRecords.findMany({
      orderBy: desc(usageRecords.updatedAt),
      where: and(
        genWhere([
          eq(usageRecords.userId, this.userId),
          genRangeWhere([startAt, endAt], usageRecords.createdAt, (date) => date.toDate()),
        ]),
      ),
    });
    // Clustering by time
    let usages = new Map<string, { date: Date; logs: UsageRecordItem[] }>();
    spends.forEach((spend) => {
      if (!usages.has(formatDate(spend.createdAt))) {
        usages.set(formatDate(spend.createdAt), { date: spend.createdAt, logs: [spend] });
        return;
      }
      usages.get(formatDate(spend.createdAt))?.logs.push(spend);
    });
    // Calculate usage
    let usageLogs: UsageLog[] = [];
    usages.forEach((spends, date) => {
      const totalSpend = spends.logs.reduce((acc, spend) => acc + spend.spend, 0);
      const totalTokens = spends.logs.reduce((acc, spend) => (spend.totalTokens || 0) + acc, 0);
      const totalRequests = spends.logs.length;
      console.log(
        'date',
        date,
        'totalSpend',
        totalSpend,
        'totalTokens',
        totalTokens,
        'totalRequests',
        totalRequests,
      );
      usageLogs.push({
        date: spends.date.getTime(),
        day: date,
        records: spends.logs,
        totalRequests,
        totalSpend,
        totalTokens, // Store the formatted date as a string
      });
    });
    // Padding to ensure the date range is complete
    const startDate = dayjs(startAt);
    const endDate = dayjs(endAt);
    const paddedUsageLogs: UsageLog[] = [];
    // For every day in the range, check if it exists in usageLogs
    // If exists, use it; if not, create a new log with 0 values
    for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
      const log = usageLogs.find((log) => log.day === date.format('YYYY-MM-DD'));
      if (log) {
        paddedUsageLogs.push(log);
      } else {
        paddedUsageLogs.push({
          date: date.toDate().getTime(),
          day: date.format('YYYY-MM-DD'),
          records: [],
          totalRequests: 0,
          totalSpend: 0,
          totalTokens: 0,
        });
      }
    }
    return paddedUsageLogs;
  };
}
