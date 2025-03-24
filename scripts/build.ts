import mongoose from "mongoose";
import { connectDB } from "../src";
import checkpoint from "../src/models/checkpoint";
import Image from "../src/models/image";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

await connectDB();

if (existsSync("./dist")) {
  rmSync("./dist", { recursive: true });
}
mkdirSync("./dist");

const LATEST_PATH = "./dist/latest.json";
const CKPT_PATH = "./dist/checkpoints.json";
const ZIP_PATH = "./dist/checkpoints.json.gz";
const METADATA_KEYS = {
  "vae": ["vae", "VAE", "Vae"],
  "size": ["size","Size",], 
  "pp": ["prompt", "Prompt", "Positive Prompt", "Positive prompt", "positivePrompt",],
  "np": ["negativePrompt", "Negative Prompt",],
  "seed": ["seed","Seed",],
  "clip": ["Clip Skip","Clip skip","clip skip",],
  "steps": ["steps", "Steps","STEMPS",],
  "sampler": ["Sampler", "sampler",],
  "denoise": ["Denoising strength", "Denoising Strength", "denoising strength", "Denoise", "denoise", "Strength", "strength"],
  "cfg": ["cfgScale", "cfg", "Guidance", "guidance",],
}

const latest = {
  modelCount: 0,
  versionCount: 0,
  itemCount: 0,
  updatedAt: Date.now(),
};

const ckpt: {
  modelId: number,
  modelName: string,
  versionId: number,
  versionName: string,
  updatedAt: number,
  files: string[],
  hashes: string[],
  metas: Record<string, string|number>[],
  workflows: string[],
}[] = [];

let errorMessages: string[] = [];

const checkpoints = await checkpoint.find({});
for (let i = 0; i < checkpoints.length; i++) {
  const c = checkpoints[i];
  console.log(`[${i}/${checkpoints.length}] ${c.name}`);
  if (!c.modelVersions) {
    continue;
  }
  latest.modelCount++;
  for (const v of c.modelVersions) {
    const modelFiles = v.files.filter((item) => item.type === "Model" || item.type === "Pruned Model");
    const fileNames = modelFiles.map((item) => item.name);
    const hashes = modelFiles.map((item) => item.hashes?.SHA256);
    latest.versionCount++;

    if (fileNames.length === 0 && hashes.length === 0) {
      errorMessages.push(`No files and No hashes: ${c.name}/${v.name}`);
      continue;
    }

    const images = await Image.find({ modelId: c.id, versionId: v.id });
    // console.log(`  ${images.length} images`);

    const workflows: string[] = [];
    const metas = images.map((image) => {
      if (!image.meta) {
        return;
      }

      const newImage: {
        id: number,
        // createdAt: number,
        vae?: string,
        size?: string,
        pp?: string,
        np?: string,
        seed?: string,
        clip?: number,
        steps?: number,
        sampler?: string,
        denoise?: number,
        cfg?: number,
      } = {
        id: image.id,
        // createdAt: image.createdAt.valueOf(),
      }

      for (const [field, keys] of Object.entries(METADATA_KEYS)) {
        for (const key of keys) {
          if (image.meta[key]) {
            newImage[field] = image.meta[key];
            break;
          }
        }
      }

      // size not found
      if (!newImage.size) {
        if (image.width && image.height) {
          newImage.size = `${image.width}x${image.height}`;
        }
      }

      // comfyui workflow
      if (image.meta.comfy && typeof image.meta.comfy === "string") {
        try {
          // check invalid json string
          const json = JSON.parse(image.meta.comfy);
          if (
            json.prompt && 
            json.workflow && 
            typeof json.prompt === "object" && 
            typeof json.workflow === "object"
          ) {
            workflows.push(image.meta.comfy);
            // newImage.workflow = image.meta.comfy;
          }
        } catch(err) {

        }
      } else if (
        image.meta.comfy && 
        typeof image.meta.comfy === "object"
      ) {
        if (
          image.meta.comfy.prompt &&
          image.meta.comfy.workflow &&
          typeof image.meta.comfy.prompt === "object" && 
          typeof image.meta.comfy.workflow === "object"
        ) {
          workflows.push(image.meta.comfy);
          // newImage.workflow = image.meta.comfy;
        }
      }

      if (image.meta.comfy && !newImage.pp) {
        return;
      }

      return newImage;
    });

    if (!c.name) {
      throw new Error(`Model name not found: ${c.id}`);
    }
    if (!v.name) {
      throw new Error(`Version name not found: ${c.name}/${v.id}`);
    }

    ckpt.push({
      modelId: c.id,
      modelName: c.name,
      versionId: v.id,
      versionName: v.name,
      updatedAt: (v.publishedAt || v.updatedAt || v.createdAt)?.valueOf() || 0,
      files: fileNames.filter((item) => typeof item === "string"),
      hashes: hashes.filter((item) => typeof item === "string"),
      metas: metas.filter((item) => typeof item === "object")
        .sort((a, b) => Object.keys(b).length - Object.keys(a).length)
        .slice(0, 3),
      workflows: workflows.slice(0, 3),
    });
  }
}

latest.itemCount = ckpt.length;

console.log(``);
console.log(`Result:`);
console.log(`  Model Count: ${latest.modelCount}`);
console.log(`  Version Count: ${latest.versionCount}`);
console.log(`  Item Count: ${latest.itemCount}`);
console.log(`  Error Count: ${errorMessages.length}`);
console.log(``);
// console.log(`Error:`);
// for (const msg of errorMessages) {
//   console.log(`  ${msg}`);
// }

// console.log(ckpt.find((item) => item.metas.length > 1));
// console.log(ckpt.find((item) => item.workflows.length > 1));

const ckptStr = JSON.stringify(ckpt);
const ckptBuf = Buffer.from(ckptStr, 'utf-8');
writeFileSync(LATEST_PATH, JSON.stringify(latest, null, 2), "utf8");
// writeFileSync(CKPT_PATH, ckptStr, "utf8");
writeFileSync(ZIP_PATH, gzipSync(ckptBuf));

await mongoose.disconnect();