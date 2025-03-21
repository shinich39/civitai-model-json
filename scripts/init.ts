import { collectMany } from "../src";

;(async () => {
  await collectMany({
    limit: "" + 100,
    types: "Checkpoint",
    period: "AllTime",
    sort: "Most Downloaded",
  });
})();