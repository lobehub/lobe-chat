import { lambdaClient } from "@/libs/trpc/client";

class UsageService {
    getUsages = async (mo?: string) => {
        return lambdaClient.usage.getUsages.query({ mo });
    };
}

export const usageService = new UsageService();