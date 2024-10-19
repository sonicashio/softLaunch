import { Migration } from '@mikro-orm/migrations';

export class Migration20241018020456 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "users" drop column "version";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" add column "version" int not null default 1;`);
  }

}
