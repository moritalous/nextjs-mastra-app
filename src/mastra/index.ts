import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";

import { createBlogIdeaAgent, createBlogReviewAgent } from "./agents";

export async function getMastra(){
  const blogIdeaAgent = await createBlogIdeaAgent();
  const blogReviewAgent = createBlogReviewAgent();

  return new Mastra({
    agents: { blogIdeaAgent, blogReviewAgent},
    logger: createLogger({
      name: "Mastra",
      level: "debug",
    }),
    telemetry: {
      serviceName: "ai",
      enabled: true,
      sampling: {
        type: "always_on", // すべてのトレースを取得
      },
      // Exporterの設定はinstrumentation.tsで行っている
    },
  });
}
