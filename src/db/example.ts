import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "./index.js";
import { type NewSettings, type Settings, settings } from "./schema.js";

// create
function createSetting(key: string, value: string): void {
  db.insert(settings).values({ key, value }).run();
}

// create & update (upsert)
function setSetting(key: string, value: string) {
  return db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    })
    .returning()
    .get() as Settings;
}

// read
function getSettings() {
  return db
    .select()
    .from(settings)
    .all()
    .reduce<Record<string, string>>((prev, curr) => {
      prev[curr.key] = curr.value;
      return prev;
    }, {});
}

// read
function getSetting(key: string) {
  return db.select().from(settings).where(eq(settings.key, key)).get();
}

// update
function updateSetting(key: string, data: Partial<NewSettings>) {
  return (
    db
      .update(settings)
      .set(data)
      .where(eq(settings.key, key))
      .returning()
      // fix type inference get() after returing()
      .get() as Settings | undefined
  );
}

// update
function updateSettings(keys: string[], data: Partial<NewSettings>) {
  if (keys.length === 0) {
    return [];
  }

  return db.update(settings).set(data).where(inArray(settings.key, keys)).returning().all();
}

// delete
function deleteSetting(key: string): boolean {
  const result = db.delete(settings).where(eq(settings.key, key)).run();
  return result.changes > 0;
}
