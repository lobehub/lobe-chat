import { lambdaClient } from "@/libs/trpc/client";

class UsageService {
    getUsages = async () => {
        return lambdaClient.usage.getUsages.query();
    };
}

export const usageService = new UsageService();