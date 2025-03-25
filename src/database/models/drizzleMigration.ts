import { LobeChatDatabase } from '@/database/type';
import { MigrationTableItem } from '@/types/clientDB';

export class DrizzleMigrationModel {
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase) {
    this.db = db;
  }

  getMigrationList = async () => {
    const res = await this.db.execute(
      'SELECT * FROM "drizzle"."__drizzle_migrations" ORDER BY "created_at" DESC;',
    );

    return res.rows as unknown as MigrationTableItem[];
  };
  getLatestMigrationHash = async () => {
    const res = await this.getMigrationList();

    return res[0].hash;
  };
}
