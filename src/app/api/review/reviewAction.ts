"use server";

import { getMastra } from "@/mastra";

// ブログレビュー用の入力型定義
type ReviewInput = {
  content: string;
};

/**
 * ブログ記事をレビューするサーバーアクション
 * Mastraエージェントを使用して実装
 */
export async function reviewBlogPost(input: ReviewInput): Promise<{ sessionId: string | undefined; review: string }> {
  // コンテンツが必要
  if (!input.content) {
    throw new Error("Content is required");
  }

  try {
    const mastra = await getMastra();
    // Mastraエージェントを取得
    const agent = mastra.getAgent("blogReviewAgent");
    
    // セッションIDを生成
    const sessionId = `session-${Date.now()}`;
    
    // エージェントを実行
    const stream = await agent.stream(input.content, {
      telemetry: {
        isEnabled: true,
        metadata: {
          sessionId,
          contentLength: input.content.length,
        },
      },
    });

    // ストリームからテキストを収集
    let reviewText = '';
    for await (const chunk of stream.textStream) {
      reviewText += chunk;
    }

    return {
      sessionId: sessionId,
      review: reviewText,
    };
  } catch (error) {
    console.error("Blog review error:", error);
    throw error;
  }
}
