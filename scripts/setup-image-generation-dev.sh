#!/bin/bash

echo "🚀 Setting up image upload development environment..."

# 1. 设置 PostgreSQL (无密码本地开发)
echo "Step 1: Setting up PostgreSQL..."
docker stop lobe-postgres 2>/dev/null && docker rm lobe-postgres 2>/dev/null
docker run -d --name lobe-postgres \
  -p 5432:5432 \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_DB=postgres \
  postgres:15

echo "Waiting for PostgreSQL to start..."
sleep 10

# 运行数据库迁移
echo "Running database migrations..."
pnpm db:migrate

# 2. 启动 MinIO
echo ""
echo "Step 2: Starting MinIO..."
docker stop lobe-minio 2>/dev/null && docker rm lobe-minio 2>/dev/null
docker run -d --name lobe-minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio:RELEASE.2025-04-22T22-12-26Z server /data --console-address ":9001"

# 3. 等待 MinIO 启动
echo "Waiting for MinIO to start..."
sleep 10

# 4. 创建 bucket 并设置权限
echo "Creating bucket and setting permissions..."
docker run --rm \
  --link lobe-minio:minio \
  --entrypoint bash \
  quay.io/minio/mc:RELEASE.2025-04-18T16-45-00Z \
  -c "
    mc config host add minio http://minio:9000 minioadmin minioadmin
    mb_output=\$(mc mb minio/lobe-chat 2>&1)
    mb_exit=\$?
    if [ \$mb_exit -ne 0 ]; then
      echo \"\$mb_output\" | grep -q 'Bucket already exists' || { echo \"Failed to create bucket: \$mb_output\"; exit \$mb_exit; }
    fi
    mc anonymous set public minio/lobe-chat
  "

# 5. 检查并添加 S3 配置
if [ ! -f .env.desktop ]; then
  echo "Creating .env.desktop from .env.example..."
  cp .env.example .env.desktop
fi

if ! grep -q "S3_ACCESS_KEY_ID" .env.desktop 2>/dev/null; then
  echo ""
  echo "Adding S3 configuration to .env.desktop..."
  echo "" >> .env.desktop
  echo "# Image Upload Configuration (added by setup-image-dev.sh)" >> .env.desktop
  echo "S3_ACCESS_KEY_ID=minioadmin" >> .env.desktop
  echo "S3_SECRET_ACCESS_KEY=minioadmin" >> .env.desktop
  echo "S3_ENDPOINT=http://localhost:9000" >> .env.desktop
  echo "S3_BUCKET=lobe-chat" >> .env.desktop
  echo "S3_REGION=us-east-1" >> .env.desktop
  echo "S3_PUBLIC_DOMAIN=http://localhost:9000/lobe-chat" >> .env.desktop
  echo "S3_ENABLE_PATH_STYLE=1" >> .env.desktop
else
  echo "S3 configuration already exists in .env.desktop"
fi

echo ""
echo "✅ Image development environment ready!"
echo ""
echo "Services running:"
echo "  - PostgreSQL: postgres://postgres@localhost:5432/postgres (no password)"
echo "  - MinIO S3: http://localhost:9000"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo ""
echo "Next step: pnpm dev:desktop"
