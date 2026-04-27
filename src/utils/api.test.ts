import { deepStrictEqual as eq } from "node:assert";
import { test } from "node:test";
import api from "./api.js";

test("api", async () => {
  eq(!!api, true);

  // await api.get(`https://httpbin.org/cookies/set?name=value`);

  // const jar = api.defaults.jar;
  // const cookies = (await jar.getCookies(`https://httpbin.org/cookies`)).map(
  //   (c) => c.toJSON(),
  // );
  // const cookies = jar.toJSON();

  // eq(cookies[0]?.value, "value");
});
