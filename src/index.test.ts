// @ts-nocheck

import { describe, test } from "node:test";
import assert from "node:assert";
import { collectMany, collectOne } from "./index.ts";

describe("index.ts", () => {
  test("test", async () => {
    // await collectOne("317902");
    // await collectMany({
    //   limit: "" + 100,
    //   types: "Checkpoint",
    //   period: "AllTime",
    //   sort: "Most Downloaded",
    // });
  });
});

function eq(a, b, msg) {
  return typeof a === "object"
    ? assert.deepStrictEqual(a, b, msg)
    : assert.strictEqual(a, b, msg);
}