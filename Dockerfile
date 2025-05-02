FROM public.ecr.aws/docker/library/node:22.11.0-slim

### Pythonは使ってないっぽいので一旦コメントアウト
# RUN apt-get update && \
#     apt-get install -y curl tar gzip ca-certificates --no-install-recommends && \
#     rm -rf /var/lib/apt/lists/*

# RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh
# RUN uv python install 3.10

WORKDIR /app

## Nodeライブラリー取得
COPY package.json package-lock.json /app/
RUN npm ci

## Next.jsのビルド
COPY eslint.config.mjs next.config.ts postcss.config.mjs tsconfig.json /app/
COPY public /app/public/
COPY src /app/src/
RUN npm run build

## Next.jsのstandaloneモードのときはコピーすると良いらしい（？）
## https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
RUN cp -r public .next/standalone/
RUN cp -r .next/static .next/standalone/.next/

## AWS Lambda Web Adapterを取得
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter

## 環境変数設定
## https://github.com/awslabs/aws-lambda-web-adapter/tree/main/examples/nextjs
ENV PORT=3000 NODE_ENV=production
ENV AWS_LWA_ENABLE_COMPRESSION=true
RUN ln -s /tmp/cache ./.next/cache

# Lambda実行時に取得するとエラーになるので、MCPサーバーをここで取得しておく
RUN npm install @modelcontextprotocol/server-brave-search

## 起動ファイル
COPY run.sh /app/
RUN chmod +x run.sh

EXPOSE 3000

CMD ["./run.sh"]
