import "dotenv/config";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { and, eq, sql } from "drizzle-orm";
import { Box, render, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import React, { useEffect, useState } from "react";
import { db } from "./db/index.js";
import {
  checkpoints,
  images,
  latest as latestTable,
  type ModelVersion,
  type NewCheckpoint,
} from "./db/schema.js";
import {
  getImages,
  getImageURL,
  getModel,
  getModels,
  getModelURL,
  type ModelOptions,
} from "./utils/civitai.js";
import { retry } from "./utils/retry.js";
import { sleep } from "./utils/sleep.js";

const LATEST_PATH = "./data/latest.json";
const CKPT_PATH = "./data/checkpoints.json";
const ZIP_PATH = "./data/checkpoints.json.gz";

const METADATA_KEYS = {
  vae: ["vae", "VAE", "Vae"],
  size: ["size", "Size"],
  pp: ["prompt", "Prompt", "Positive Prompt", "Positive prompt", "positivePrompt"],
  np: ["negativePrompt", "Negative Prompt"],
  seed: ["seed", "Seed"],
  clip: ["Clip Skip", "Clip skip", "clip skip"],
  steps: ["steps", "Steps", "STEMPS"],
  sampler: ["Sampler", "sampler"],
  denoise: [
    "Denoising strength",
    "Denoising Strength",
    "denoising strength",
    "Denoise",
    "denoise",
    "Strength",
    "strength",
  ],
  cfg: ["cfgScale", "cfg", "Guidance", "guidance"],
};

const MAX_META_COUNT = 3;
const MAX_WORKFLOW_COUNT = 3;

// ---------------------------------------------------------------------------
// Latest helpers
// ---------------------------------------------------------------------------

async function getLatest() {
  const row = db.select().from(latestTable).get();
  if (!row) {
    const inserted = db.insert(latestTable).values({}).returning().get();
    return inserted;
  }
  return row;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function upsertCheckpoint(c: any) {
  const row: NewCheckpoint = {
    id: c.id,
    name: c.name ?? null,
    description: c.description ?? null,
    creatorUsername: c.creator.username,
    statsDownloadCount: c.stats?.downloadCount ?? null,
    statsFavoriteCount: c.stats?.favoriteCount ?? null,
    statsThumbsUpCount: c.stats?.thumbsUpCount ?? null,
    statsThumbsDownCount: c.stats?.thumbsDownCount ?? null,
    statsCommentCount: c.stats?.commentCount ?? null,
    statsRatingCount: c.stats?.ratingCount ?? null,
    statsRating: c.stats?.rating ?? null,
    statsTippedAmountCount: c.stats?.tippedAmountCount ?? null,
    tags: c.tags ?? [],
    modelVersions: c.modelVersions ?? [],
    updatedAt: new Date(),
  };

  db.insert(checkpoints)
    .values(row)
    .onConflictDoUpdate({
      target: checkpoints.id,
      set: {
        ...row,
        updatedAt: new Date(),
      },
    })
    .run();
}

// ---------------------------------------------------------------------------
// Parse images
// ---------------------------------------------------------------------------

function parseImages(imgs: any[]) {
  const workflows: string[] = [];
  const metas: any[] = [];

  for (const image of imgs) {
    if (!image.meta) continue;

    const newMeta: Record<string, string | number> & { id: number } = { id: image.id };

    for (const [field, keys] of Object.entries(METADATA_KEYS)) {
      for (const key of keys) {
        if (image.meta[key]) {
          (newMeta as any)[field] = image.meta[key];
          break;
        }
      }
    }

    if (!newMeta.size && image.width && image.height) {
      newMeta.size = `${image.width}x${image.height}`;
    }

    // ComfyUI workflow
    if (image.meta.comfy && typeof image.meta.comfy === "string") {
      try {
        const json = JSON.parse(image.meta.comfy);
        if (
          json.prompt &&
          json.workflow &&
          typeof json.prompt === "object" &&
          typeof json.workflow === "object"
        ) {
          workflows.push(image.meta.comfy);
        }
      } catch {
        /* ignore */
      }
    } else if (image.meta.comfy && typeof image.meta.comfy === "object") {
      if (
        image.meta.comfy.prompt &&
        image.meta.comfy.workflow &&
        typeof image.meta.comfy.prompt === "object" &&
        typeof image.meta.comfy.workflow === "object"
      ) {
        workflows.push(image.meta.comfy);
      }
    }

    if (image.meta.comfy && !newMeta.pp) continue;

    metas.push(newMeta);
  }

  return { metas, workflows };
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

async function build() {
  if (existsSync("./data")) rmSync("./data", { recursive: true });
  mkdirSync("./data");

  const latest = {
    modelCount: 0,
    versionCount: 0,
    itemCount: 0,
    updatedAt: Date.now(),
  };

  const ckpt: {
    modelId: number;
    modelName: string;
    versionId: number;
    versionName: string;
    updatedAt: number;
    files: string[];
    hashes: string[];
    metas: Record<string, string | number>[];
    workflows: string[];
  }[] = [];

  const errorMessages: string[] = [];

  const allCheckpoints = db.select().from(checkpoints).all();

  for (let i = 0; i < allCheckpoints.length; i++) {
    const c = allCheckpoints[i];
    console.log(`[${i}/${allCheckpoints.length}] ${c.name}`);

    const versions = (c.modelVersions as ModelVersion[]) ?? [];
    if (!versions.length) continue;

    latest.modelCount++;

    for (const v of versions) {
      const modelFiles = v.files.filter((f) => f.type === "Model" || f.type === "Pruned Model");
      const fileNames = modelFiles.map((f) => f.name);
      const hashes = modelFiles.map((f) => f.hashes?.SHA256);
      latest.versionCount++;

      if (fileNames.length === 0 && hashes.length === 0) {
        errorMessages.push(`No files and No hashes: ${c.name}/${v.name}`);
        continue;
      }

      const imgs = db
        .select()
        .from(images)
        .where(and(eq(images.modelId, c.id), eq(images.versionId, v.id)))
        .all();

      // meta is stored as JSON in sqlite; parse if needed
      const parsedImgs = imgs.map((img) => ({
        ...img,
        meta: typeof img.meta === "string" ? JSON.parse(img.meta) : img.meta,
      }));

      const { metas, workflows } = parseImages(parsedImgs);

      if (!c.name) throw new Error(`Model name not found: ${c.id}`);
      if (!v.name) throw new Error(`Version name not found: ${c.name}/${v.id}`);

      const publishedAt = v.publishedAt ? new Date(v.publishedAt).valueOf() : 0;
      const updatedAt = v.updatedAt ? new Date(v.updatedAt).valueOf() : 0;
      const createdAt = v.createdAt ? new Date(v.createdAt).valueOf() : 0;

      ckpt.push({
        modelId: c.id,
        modelName: c.name,
        versionId: v.id,
        versionName: v.name,
        updatedAt: publishedAt || updatedAt || createdAt,
        files: fileNames.filter((f): f is string => typeof f === "string"),
        hashes: hashes.filter((h): h is string => typeof h === "string"),
        metas: metas
          .filter((m) => typeof m === "object")
          .sort((a, b) => Object.keys(b).length - Object.keys(a).length)
          .slice(0, MAX_META_COUNT),
        workflows: workflows.slice(0, MAX_WORKFLOW_COUNT),
      });
    }
  }

  latest.itemCount = ckpt.length;

  console.log(`\nResult:`);
  console.log(`  Model Count: ${latest.modelCount}`);
  console.log(`  Version Count: ${latest.versionCount}`);
  console.log(`  Item Count: ${latest.itemCount}`);
  console.log(`  Error Count: ${errorMessages.length}\n`);

  writeFileSync("./error.log", errorMessages.join("\n"), "utf8");

  const ckptStr = JSON.stringify(ckpt);
  writeFileSync(LATEST_PATH, JSON.stringify(latest, null, 2), "utf8");
  writeFileSync(ZIP_PATH, gzipSync(Buffer.from(ckptStr, "utf-8")));
}

// ---------------------------------------------------------------------------
// Collect
// ---------------------------------------------------------------------------

async function collectOne(id: string) {
  const url = getModelURL(id);
  console.log(`GET: ${url}`);
  const c = await retry(async () => getModel(url), {
    count: 3,
    delay: 1024,
  });

  const username = c.creator?.username;

  upsertCheckpoint(c);

  for (const v of c.modelVersions) {
    const imgs = await retry(
      async () =>
        getImages(
          getImageURL({
            modelId: c.id,
            modelVersionId: v.id,
            username,
          }),
        ),
      {
        count: 3,
        delay: 1024,
      },
    );

    let collectedCount = 0;
    for (const i of imgs) {
      try {
        const existing = db.select().from(images).where(eq(images.id, i.id)).get();

        if (!existing) {
          db.insert(images)
            .values({
              ...i,
              modelId: c.id,
              versionId: v.id,
              meta: i.meta ?? null,
              createdAt: i.createdAt ? new Date(i.createdAt) : null,
            })
            .run();
          collectedCount++;
        }
      } catch (err) {
        if (err instanceof Error) console.error(`Error: ${err.message}`);
      }
    }

    console.log(`${collectedCount} images collected: ${c.name}/${v.name}`);
  }
}

async function collectMany(options: ModelOptions, skipCollectedVersion = true) {
  const l = await getLatest();

  const initialUrl = l.url || getModelURL(options);
  console.log(`GET: ${initialUrl}`);
  let res = await getModels(initialUrl);

  let ckptCount = 0;

  while (true) {
    if (!res) {
      console.log("Next page not found, no response");
      db.delete(latestTable).where(eq(latestTable.id, l.id)).run();
      break;
    }

    for (const c of res.items) {
      ckptCount += 1;

      const username = c?.creator?.username;

      upsertCheckpoint(c);
      console.log(`[${ckptCount}] Checkpoint upserted: ${c.name}`);
      await sleep(1024);

      for (const v of c.modelVersions) {
        try {
          if (skipCollectedVersion) {
            const prevImage = db
              .select()
              .from(images)
              .where(and(eq(images.modelId, c.id), eq(images.versionId, v.id)))
              .get();
            if (prevImage) continue;
          }

          const imgs = await retry(
            async () =>
              getImages(
                getImageURL({
                  modelId: c.id,
                  modelVersionId: v.id,
                  username,
                }),
              ),
            {
              count: 3,
              delay: 1024,
            },
          );

          let collectedCount = 0;
          for (const i of imgs) {
            try {
              const existing = db.select().from(images).where(eq(images.id, i.id)).get();

              if (!existing) {
                db.insert(images)
                  .values({
                    ...i,
                    modelId: c.id,
                    versionId: v.id,
                    meta: i.meta ?? null,
                    createdAt: i.createdAt ? new Date(i.createdAt) : null,
                  })
                  .run();
                collectedCount++;
              }
            } catch (err) {
              if (err instanceof Error) console.error(`Error: ${err.message}`);
            }
          }

          console.log(`[${ckptCount}] ${collectedCount} images collected: ${c.name}/${v.name}`);
          await sleep(1024);
        } catch (err) {
          if (err instanceof Error) console.error(`Error: ${err.message}`);
          await sleep(1024);
        }
      }
    }

    if (typeof res?.metadata?.nextPage === "string") {
      db.update(latestTable)
        .set({ url: res.metadata.nextPage })
        .where(eq(latestTable.id, l.id))
        .run();

      const url = res.metadata.nextPage;
      console.log(`GET: ${url}`);
      res = await getModels(url);
      await sleep(1024);
    } else {
      console.log("Next page not found", res.metadata);
      db.delete(latestTable).where(eq(latestTable.id, l.id)).run();
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

async function analysis() {
  const allCheckpoints = db.select().from(checkpoints).all();

  const acc: Record<string, number> = {};
  const total = allCheckpoints.length;
  const progress = (n: number) => Math.floor((n / total) * 100) + "%";
  let prevProgress = "";

  for (let i = 0; i < allCheckpoints.length; i++) {
    const c = allCheckpoints[i];
    const versions = (c.modelVersions as ModelVersion[]) ?? [];
    if (!versions.length) continue;

    for (const v of versions) {
      const imgs = db
        .select()
        .from(images)
        .where(and(eq(images.modelId, c.id), eq(images.versionId, v.id)))
        .all();

      const parsedImgs = imgs.map((img) => ({
        ...img,
        meta: typeof img.meta === "string" ? JSON.parse(img.meta) : img.meta,
      }));

      const { metas } = parseImages(parsedImgs);

      for (const m of metas) {
        if (!m.pp || !(m.pp as string).trim()) continue;

        const words = (m.pp as string)
          .toLowerCase()
          .trim()
          .replace(/\\/g, "")
          .replace(/</g, ",<")
          .replace(/(?::\s?\d+\.?\d*?)?>/g, ">,")
          .replace(/\s*,\s*/g, ",")
          .replace(/,+/g, ",")
          .replace(/[([{|]/g, "")
          .replace(/(?::\s?\d+\.?\d*?)?[}\])]/g, "")
          .replace(/\s/g, "_")
          .split(",")
          .filter(Boolean)
          .map((t) => t.replace(/^_+/g, "").replace(/_+$/g, ""));

        for (const t of words) {
          acc[t] = (acc[t] ?? 0) + 1;
        }
      }
    }

    const newProgress = progress(i);
    if (prevProgress !== newProgress) {
      prevProgress = newProgress;
      console.log(newProgress, i, total);
    }
  }

  console.log(`100%`, total, total);

  const result = Object.entries(acc)
    .map(([k, v]) => ({ value: k, count: v }))
    .filter((item) => item.count > 1)
    .sort((a, b) =>
      b.count !== a.count ? b.count - a.count : b.value.localeCompare(a.value, "en"),
    );

  writeFileSync("data/most-used-words.json", JSON.stringify(result, null, 2), "utf8");
  writeFileSync(
    "data/most-used-words.csv",
    result.map((item) => `${item.value},${item.count}`).join("\n"),
  );
}

function App() {
  const { exit } = useApp();
  const [message, setMessage] = useState("Hello, world!");
  const [route, setRoute] = useState("/");
  const [inProgress, setInProgress] = useState(false);

  return (
    <Box flexDirection="column">
      <Text color="green">{message}</Text>

      {route === "/one" && (
        <TextInput
          value=""
          placeholder="CIVITAI MODEL ID e.g., 12345678"
          onChange={() => {}}
          onSubmit={async (id) => {
            await collectOne(id);
            setRoute("/");
          }}
        />
      )}

      {route === "/" && (
        <SelectInput
          items={[
            { label: "Build", value: "build" },
            { label: "Weekly", value: "update-weekly" },
            { label: "Monthly", value: "update-monthly" },
            { label: "All", value: "all" },
            { label: "One", value: "one" },
            { label: "Exit", value: "exit" },
          ]}
          onSelect={async ({ value }) => {
            if (inProgress) {
              return;
            }

            if (value === "build") {
              setInProgress(true);

              // Create checkpoints.json
              await build();

              // Create most-used-words.csv
              await analysis();

              setInProgress(false);
              return;
            }

            if (value === "update-weekly") {
              setInProgress(true);
              await collectMany({
                limit: "100",
                types: "Checkpoint",
                period: "Week",
                sort: "Newest",
              });
              await collectMany({
                limit: "100",
                types: "Checkpoint",
                period: "Week",
                sort: "Most Downloaded",
              });
              setInProgress(false);
              return;
            }

            if (value === "update-monthly") {
              setInProgress(true);
              await collectMany({
                limit: "100",
                types: "Checkpoint",
                period: "Month",
                sort: "Newest",
              });
              await collectMany({
                limit: "100",
                types: "Checkpoint",
                period: "Month",
                sort: "Most Downloaded",
              });
              setInProgress(false);
              return;
            }

            if (value === "all") {
              setInProgress(true);
              await collectMany({
                limit: "100",
                types: "Checkpoint",
                period: "AllTime",
                sort: "Most Downloaded",
              });
              setInProgress(false);
              return;
            }

            if (value === "one") {
              setRoute("/one");
              return;
            }

            if (value === "exit") {
              exit();
              return;
            }
          }}
        />
      )}
    </Box>
  );
}

render(<App />);
