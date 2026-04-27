// image.ts
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const images = sqliteTable(
  "images",
  {
    id: integer("id").primaryKey(),
    modelId: integer("model_id").notNull(),
    versionId: integer("version_id").notNull(),
    url: text("url"),
    hash: text("hash"),
    width: integer("width"),
    height: integer("height"),
    createdAt: integer("created_at", { mode: "timestamp" }),
    postId: integer("post_id"),

    // stats (flattened)
    statsCryCount: integer("stats_cry_count"),
    statsLaughCount: integer("stats_laugh_count"),
    statsLikeCount: integer("stats_like_count"),
    statsDislikeCount: integer("stats_dislike_count"),
    statsHeartCount: integer("stats_heart_count"),
    statsCommentCount: integer("stats_comment_count"),

    // Mixed → JSON
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (table) => [
    index("images_model_id_idx").on(table.modelId),
    index("images_version_id_idx").on(table.versionId),
  ],
);

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
