'use strict';

import dotenv from "dotenv";
import mongoose from "mongoose";
import Checkpoint from "./models/checkpoint";
import Image from "./models/image";
import Latest from "./models/latest";
import { getImages, getImageURL, getModel, getModels, getModelURL, ModelOptions } from "./common/civitai";
import { wait } from "./common/utils";
dotenv.config();

mongoose.set("strictQuery", false);
mongoose.set('autoIndex', true);
mongoose.set('debug', false);

export function connectDB() {
  return new Promise((resolve, reject) => {
    mongoose.connect("mongodb://127.0.0.1:27017/civitai");
    
    mongoose.connection.on('error', function (err) {
      reject(err);
    });

    mongoose.connection.once('open', function () {
      console.log('Mongoose: Connection Succeeded');
      resolve(undefined);
    });
  });
}

async function getLatest() {
  const l = await Latest.findOne({});
  if (!l) {
    const newLatest = new Latest();
    await newLatest.save();
    return newLatest;
  } else {
    return l;
  }
}

export async function collectOne(id: string) {
  await connectDB();

  const l = await getLatest();

  const c = await getModel(getModelURL(id));
  if (!c?.creator?.username) {
    console.error(`creator.username not found: ${c.name}`);
    return;
  }

  const prevCkpt = await Checkpoint.findOne({ id: c.id });
  if (!prevCkpt) {
    const ckpt = new Checkpoint(c);
    await ckpt.save();
  } else {
    Object.assign(prevCkpt, c);
    prevCkpt.updatedAt = new Date();
    await prevCkpt.save();
  }

  for (const v of c.modelVersions) {
    const images = await getImages(getImageURL({
      modelId: c.id,
      modelVersionId: v.id,
      username: c.creator.username,
    }));

    for (const i of images) {
      try {
        const prevImage = await Image.findOne({ id: i.id });
        if (!prevImage) {
          const image = new Image(i);
          image.modelId = c.id;
          image.versionId = v.id;
          await image.save();
        }
      } catch(err) {
        if (err instanceof Error) {
          console.error(`Error: ${err.message}`);
        }
      }
    }
  }
  await mongoose.disconnect();
}

export async function collectMany(
  options: ModelOptions,
  skipCollectedVersion = true,
) {
  await connectDB();

  const l = await getLatest();
  
  let res = await getModels(
    l.url ||
    getModelURL(options)
  );

  let pageCount = 0, ckptCount = 0, retryCount = 3;
  while(retryCount > 0) {
    try {
      pageCount += 1;
      // console.log(`Page ${pageCount}`);

      for (const c of res.items) {
        ckptCount += 1;

        if (!c?.creator?.username) {
          console.error(`[${ckptCount}] creator.username not found: ${c.name}`);
          continue;
        }

        const prevCkpt = await Checkpoint.findOne({ id: c.id });
        if (!prevCkpt) {
          const ckpt = new Checkpoint(c);
          await ckpt.save();
          console.log(`[${ckptCount}] Checkpoint created: ${ckpt.name}`);
        } else {
          Object.assign(prevCkpt, c);
          prevCkpt.updatedAt = new Date();
          await prevCkpt.save();
          console.log(`[${ckptCount}] Checkpoint updated: ${prevCkpt.name}`);
        }

        for (const v of c.modelVersions) {
          try {
            if (skipCollectedVersion) {
              const prevImages = await Image.find({ modelId: c.id, versionId: v.id });
              if (prevImages.length > 0) {
                console.log(`[${ckptCount}] Already images collected: ${c.name}/${v.name}`);
                continue;
              }
            }

            const images = await getImages(getImageURL({
              modelId: c.id,
              modelVersionId: v.id,
              username: c.creator.username,
            }));

            for (const i of images) {
              try {
                const prevImage = await Image.findOne({ id: i.id });
                if (!prevImage) {
                  const image = new Image(i);
                  image.modelId = c.id;
                  image.versionId = v.id;
                  await image.save();
                  // console.log(`[${ckptCount}] Image created: ${c.name}/${v.name}`);
                } else {
                  // console.log(`[${ckptCount}] Image already exists: ${c.name}/${v.name}`);
                }
              } catch(err) {
                if (err instanceof Error) {
                  console.error(`Error: ${err.message}`);
                }
              }
            }

            console.log(`[${ckptCount}] Images collected: ${c.name}/${v.name}`);
          } catch(err) {
            if (err instanceof Error) {
              console.error(`Error: ${err.message}`);
            }
          }
        }
      }

      if (typeof res?.metadata?.nextPage === "string") {
        l.url = res.metadata.nextPage;
        await l.save();
        res = await getModels(l.url);
      } else {
        console.log("Next page not found");
        console.log("Metadata:", res.metadata);
        l.url = undefined;
        await l.save();
        break;
      }

      retryCount = 3;
    } catch(err) {
      if (err instanceof Error) {
        console.error(`Error: ${err.message}`);
      }
      if (typeof l.url !== "string") {
        break;
      }
      console.log("Retrying...");
      retryCount--;
      await wait(1000 * 10);
      res = await getModels(l.url);
    }
  }
  await mongoose.disconnect();
}