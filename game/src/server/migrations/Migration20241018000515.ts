import { Migration } from '@mikro-orm/migrations';

export class Migration20241018000515 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create type "fortune_wheel_item_type" as enum ('nothing', 'balance', 'energy_replenishment');`);
    this.addSql(`create table "fortune_wheel" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "index" int not null, "title" varchar(64) not null, "type" "fortune_wheel_item_type" not null, "chance" int not null, "reward" jsonb not null);`);
    this.addSql(`alter table "fortune_wheel" add constraint "fortune_wheel_title_unique" unique ("title");`);

    this.addSql(`alter table "settings" drop column "telegram_web_app_url";`);

    this.addSql(`alter table "settings" add column "max_referrals_for_fortune_wheel_per_day" int not null default 5, add column "fortune_wheel_spins_per_referral" int not null default 2;`);

    this.addSql(`alter table "users" add column "last_free_fortune_wheel_spin_time" bigint null, add column "fortune_wheel_additional_spins_left" int not null default 0, add column "daily_fortune_wheel_daily_referrals_day_time" bigint null, add column "fortune_wheel_daily_referrals_count" int not null default 0;`);

    this.addSql(`alter table "user_characters" drop column "version";`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "fortune_wheel" cascade;`);

    this.addSql(`alter table "settings" drop column "max_referrals_for_fortune_wheel_per_day", drop column "fortune_wheel_spins_per_referral";`);

    this.addSql(`alter table "settings" add column "telegram_web_app_url" varchar(255) null default 'https://t.me/s0nicash_bot/start';`);

    this.addSql(`alter table "users" drop column "last_free_fortune_wheel_spin_time", drop column "fortune_wheel_additional_spins_left", drop column "daily_fortune_wheel_daily_referrals_day_time", drop column "fortune_wheel_daily_referrals_count";`);

    this.addSql(`alter table "user_characters" add column "version" int not null default 1;`);

    this.addSql(`drop type "fortune_wheel_item_type";`);
  }

}
