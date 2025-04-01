/**
 * 这个文件导出了数据库实例
 *
 * 【重要】使用说明：
 * 1. 推荐使用方式：先调用 getServerDB() 初始化数据库，然后再使用 serverDB
 *    例如：
 *    ```
 *    const db = await getServerDB();
 *    const result = await db.query.users.findMany();
 *    ```
 *
 * 2. 如果直接使用 serverDB，需要确保在其他地方已经调用过 getServerDB()
 *    否则会抛出错误
 */
export { getServerDB, serverDB } from '../core/db-adaptor';
