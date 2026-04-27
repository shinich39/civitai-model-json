import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { gunzip, gzip, type ZlibOptions } from "node:zlib";

export async function createDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readDir(dirPath: string): Promise<string[] | undefined> {
  try {
    return (
      await fs.readdir(dirPath, {
        recursive: true,
        encoding: "utf-8",
      })
    ).map((filename) => path.join(dirPath, filename));
  } catch {
    return undefined;
  }
}

export async function removeDir(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

export async function readBuffer(filePath: string): Promise<Buffer<ArrayBuffer>> {
  return await fs.readFile(filePath);
}

export async function writeBuffer(filePath: string, value: NodeJS.ArrayBufferView) {
  await fs.writeFile(filePath, value);
}

export async function readString(filePath: string): Promise<string> {
  return await fs.readFile(filePath, { encoding: "utf-8" });
}

export async function writeString(filePath: string, value: string) {
  await fs.writeFile(filePath, value, "utf-8");
}

export async function writeJson(
  filePath: string,
  value: Parameters<typeof JSON.stringify>[0],
  replacer?: Parameters<typeof JSON.stringify>[1],
  space?: Parameters<typeof JSON.stringify>[2],
): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(value, replacer, space), "utf-8");
}

export async function readJson<T>(filePath: string): Promise<T | undefined> {
  try {
    const text = await fs.readFile(filePath, "utf-8");
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

export async function writeJsonl(
  filePath: string,
  value: Parameters<typeof JSON.stringify>[0],
): Promise<void> {
  const str = JSON.stringify(value) + "\n";
  await fs.appendFile(filePath, str, { encoding: "utf-8" });
}

export async function readJsonl<T extends object>(
  filePath: string,
  callback: (chunk: T, index: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    const readline = createInterface({ input: stream, crlfDelay: Infinity });

    let index = 0;
    readline.on("line", (line) => {
      if (!line.trim()) {
        return;
      }
      try {
        const obj = JSON.parse(line) as T;
        callback(obj, index++);
      } catch (err) {
        stream.destroy(err instanceof Error ? err : new Error("An unexpected error occurred."));
      }
    });

    stream.on("error", reject);
    readline.on("close", resolve);
  });
}

export async function removeFile(filePath: string): Promise<void> {
  await fs.rm(filePath, { force: true });
}

export function toGzip(
  input: string | ArrayBuffer | NodeJS.ArrayBufferView,
  options: ZlibOptions = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffer = typeof input === "string" ? Buffer.from(input) : input;
    gzip(buffer, options, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

export function fromGzip(
  buffer: string | ArrayBuffer | NodeJS.ArrayBufferView,
  options: ZlibOptions = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    gunzip(buffer, options, (err, res) => (err ? reject(err) : resolve(res)));
  });
}
