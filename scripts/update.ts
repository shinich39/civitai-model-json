import { collectMany } from "../src";

;(async () => {
  await collectMany({
    limit: "" + 100,
    types: "Checkpoint",
    period: "Month",
    sort: "Newest",
  });

  await collectMany({
    limit: "" + 100,
    types: "Checkpoint",
    period: "Month",
    sort: "Highest Rated",
  });
})();