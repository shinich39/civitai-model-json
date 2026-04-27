// checkpoint.ts
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const checkpoints = sqliteTable("checkpoints", {
  id: integer("id").primaryKey(),
  name: text("name"),
  description: text("description"),

  // stats (flattened)
  statsDownloadCount: integer("stats_download_count"),
  statsFavoriteCount: integer("stats_favorite_count"),
  statsThumbsUpCount: integer("stats_thumbs_up_count"),
  statsThumbsDownCount: integer("stats_thumbs_down_count"),
  statsCommentCount: integer("stats_comment_count"),
  statsRatingCount: integer("stats_rating_count"),
  statsRating: real("stats_rating"),
  statsTippedAmountCount: integer("stats_tipped_amount_count"),

  creatorUsername: text("creator_username").notNull(),

  // arrays/objects → JSON
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  modelVersions: text("model_versions", { mode: "json" }).$type<ModelVersion[]>(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type ModelVersionFile = {
  id: number;
  sizeKB: number;
  name: string;
  type: string;
  metadata: { format: string; size: string; fp: string };
  hashes: {
    AutoV1: string;
    AutoV2: string;
    AutoV3: string;
    SHA256: string;
    CRC32: string;
    BLAKE3: string;
  };
  downloadUrl: string;
};

export type ModelVersion = {
  id: number;
  index: number;
  name: string;
  baseModel: string;
  baseModelType: string;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  description: string;
  trainedWords: string[];
  stats: {
    downloadCount: number;
    ratingCount: number;
    rating: number;
    thumbsUpCount: number;
    thumbsDownCount: number;
  };
  files: ModelVersionFile[];
};

export type Checkpoint = typeof checkpoints.$inferSelect;
export type NewCheckpoint = typeof checkpoints.$inferInsert;
