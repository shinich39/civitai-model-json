import { deepStrictEqual as eq } from "node:assert";
import { test } from "node:test";
import dt from "./dt.js";

test("dt: timezone", async () => {
  const d1 = dt().tz("America/New_York"); // 2025-05-31T20:13:56-04:00
  const d2 = dt().tz("Asia/Seoul"); // 2025-06-01T09:13:56+09:00
  const d3 = dt().utc(); // 2025-06-01T09:13:56+00:00
  eq(d1.utcOffset(), 60 * -4); // -04:00
  eq(d2.utcOffset(), 60 * 9); // +09:00
  eq(d3.utcOffset(), 0); // +00:00, default
});

test("dt: utcOffset", async () => {
  const d4 = dt().utcOffset(60 * 9); // 2025-06-01T09:13:56+09:00
  const d5 = dt().utc(); // 2025-06-01T00:13:56Z
  eq(d4.utcOffset(), 60 * 9);
  eq(d5.utcOffset(), 0);
});

test("dt: diff", async () => {
  const d6 = dt().add(3, "day");
  const d7 = dt();
  eq(d6.diff(d7, "day"), 3);
  eq(d6.diff(d7, "hour"), 24 * 3);
  eq(d6.diff(d7, "minute"), 60 * 24 * 3);

  const d8 = d6.add(1, "day");
  eq(d8.diff(d7, "day"), 4);
  eq(d8.diff(d7, "hour"), 24 * 4);
  eq(d8.diff(d7, "minute"), 60 * 24 * 4);
});

test("dt: duration", async () => {
  eq(dt.duration(1, "hour").asHours(), 1);
  eq(dt.duration(1, "minutes").asMinutes(), 1);
  eq(dt.duration(1, "minutes").asSeconds(), 60);
});

test("dt: startOf", async () => {
  eq(dt().startOf("day").format("HH:mm:ss"), "00:00:00");
});

test("dt: endOf", async () => {
  eq(dt().endOf("day").format("HH:mm:ss"), "23:59:59");
});

test("dt: extract value", async () => {
  eq(dt("23:39:59", "HH:mm:ss").hour(), 23);
  eq(dt("23:39:59", "HH:mm:ss").minute(), 39);
  eq(dt("23:39:59", "HH:mm:ss").second(), 59);
});
