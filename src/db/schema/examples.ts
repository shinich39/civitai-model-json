import {
  type AnySQLiteColumn,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const examples = sqliteTable(
  "examples",
  {
    id: integer("id").primaryKey(),

    // text with unique
    title: text("title").notNull().unique(),

    // float
    price: real("price"),

    // int
    views: integer("views").default(0),

    // boolean (stored as integer)
    published: integer("published", { mode: "boolean" }).default(false),

    // object
    meta: text("meta", { mode: "json" }).$type<Record<string, string>>(),

    // array
    tags: text("tags", { mode: "json" }).$type<string[]>(),

    // foreign key
    exampleId: integer("example_id")
      .notNull()
      .references((): AnySQLiteColumn => examples.id, { onDelete: "cascade" }),

    // date
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    // index
    index("examples_title_idx").on(table.title),

    // composite unique index
    uniqueIndex("examples_id_title_idx").on(table.id, table.title),

    // composite index
    index("examples_id_created_at_idx").on(table.id, table.createdAt),
  ],
);

export type Example = typeof examples.$inferSelect;
export type NewExample = typeof examples.$inferInsert;
