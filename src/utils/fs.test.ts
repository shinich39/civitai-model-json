import { deepStrictEqual as eq, ok } from "node:assert";
import { existsSync, rmSync } from "node:fs";
import { test } from "node:test";
import {
  createDir,
  fromGzip,
  readBuffer,
  readJson,
  readJsonl,
  readString,
  removeFile,
  toGzip,
  writeBuffer,
  writeJson,
  writeJsonl,
  writeString,
} from "./fs.js";

test("fs: createDir", async () => {
  await createDir("uploads");
  eq(existsSync("./uploads"), true);
});

test("fs: string", async () => {
  await writeString("./uploads/test.txt", "abc");

  const text = await readString("./uploads/test.txt");
  ok(text);
  eq(text, "abc");

  await removeFile("./uploads/test.txt");
});

test("fs: buffer", async () => {
  const buf = Buffer.from("abc", "utf-8");
  await writeBuffer("./uploads/buffer.bin", buf);

  const buffer = await readBuffer("./uploads/buffer.bin");
  ok(buffer);
  eq(buffer, buf);

  await removeFile("./uploads/buffer.bin");
});

test("fs: json", async () => {
  await writeJson("./uploads/test.json", { message: "GOOD" });

  const json = await readJson<{ message: string }>("./uploads/test.json");
  ok(json);
  eq(json.message, "GOOD");

  await removeFile("./uploads/test.json");
});

test("fs: jsonl", async () => {
  await removeFile("./uploads/test.jsonl");

  await writeJsonl("./uploads/test.jsonl", { a: 1 });
  await writeJsonl("./uploads/test.jsonl", { b: 2 });
  await writeJsonl("./uploads/test.jsonl", { c: 3 });

  const jsonl: any[] = [];

  await readJsonl("./uploads/test.jsonl", (chunk, index) => {
    jsonl.push(chunk);
  });

  eq(jsonl, [{ a: 1 }, { b: 2 }, { c: 3 }]);

  await removeFile("./uploads/test.jsonl");
});

test("fs: gzip", async () => {
  const originalStr = "hello gzip";
  const compressedStr = await toGzip(originalStr);
  const decompressedStr = await fromGzip(compressedStr);
  eq(decompressedStr.toString("utf8"), originalStr);

  const originalBuf = Buffer.from([1, 2, 3, 4, 5]);
  const compressedBuf = await toGzip(originalBuf);
  const decompressedBuf = await fromGzip(compressedBuf);
  eq(decompressedBuf, originalBuf);
});
