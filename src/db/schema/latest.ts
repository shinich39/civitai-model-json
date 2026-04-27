// latest.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const latest = sqliteTable("latest", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url"),
});

export type Latest = typeof latest.$inferSelect;
export type NewLatest = typeof latest.$inferInsert;
