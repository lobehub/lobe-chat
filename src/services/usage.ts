import { lambdaClient } from "@/libs/trpc/client";

class UsageService {
    getUsages = async (mo?: string) => {
        return lambdaClient.usage.getUsages.query({ mo });
    };

    getRequests = async (mo?: string) => {
        return lambdaClient.usage.getSpendLogs.query({ mo });
    }
}

export const usageService = new UsageService();