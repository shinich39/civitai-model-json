import "dotenv/config";
import { db } from "./index.js";
import { settings } from "./schema.js";

async function seed() {
  await db
    .insert(settings)
    .values([{ key: "maintenance_mode", value: "0" }])
    .onConflictDoNothing();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
