import { PGlite } from "@electric-sql/pglite";
import { createServer } from "pglite-server";

// 创建或连接到您现有的 PGlite 数据库
const db = new PGlite("/Users/arvinxx/Library/Application Support/lobehub-desktop/lobehub-local-db");
await db.waitReady;

// 创建服务器并监听端口
const PORT = 6543;
const pgServer = createServer(db);

pgServer.listen(PORT, () => {
  console.log(`PGlite 服务器已启动，监听端口 ${PORT}`);
});
